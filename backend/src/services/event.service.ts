import { prisma } from '../config/db.js';
import {
  CreateEventInput,
  UpdateEventInput,
  AdminModerateEventInput,
} from '../validators/event.validator.js';
import {
  ConflictError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../utils/errors.js';
import { EventStatus, Role, ClubMemberRole, NotificationType } from '@prisma/client';
import { notificationService } from './notification.service.js';
import { emailService } from '../utils/email.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class EventService {
  async listEvents(params: {
    search?: string;
    category?: string;
    clubSlug?: string;
    status?: EventStatus;
    timeFilter?: 'upcoming' | 'past' | 'all';
    page?: number;
    limit?: number;
    currentUserId?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 12));
    const skip = (page - 1) * limit;

    const where: any = {};
    const now = new Date();

    if (params.status) {
      where.status = params.status;
    } else {
      // By default for public discovery, only show APPROVED or COMPLETED
      where.status = { in: [EventStatus.APPROVED, EventStatus.COMPLETED] };
    }

    if (params.timeFilter === 'upcoming') {
      where.endDateTime = { gte: now };
    } else if (params.timeFilter === 'past') {
      where.endDateTime = { lt: now };
    }

    if (params.category && params.category !== 'All') {
      where.category = { equals: params.category, mode: 'insensitive' };
    }

    if (params.clubSlug) {
      where.club = { slug: params.clubSlug };
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { venue: { contains: params.search, mode: 'insensitive' } },
        { club: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDateTime: params.timeFilter === 'past' ? 'desc' : 'asc' },
        include: {
          club: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              logo: true,
            },
          },
          _count: {
            select: {
              registrations: true,
              attendances: true,
            },
          },
          registrations: params.currentUserId
            ? {
                where: { userId: params.currentUserId },
                select: {
                  id: true,
                  status: true,
                  qrToken: true,
                  waitlistPosition: true,
                },
              }
            : false,
        },
      }),
    ]);

    const formatted = events.map((e) => {
      const { registrations, ...rest } = e as any;
      return {
        ...rest,
        userRegistration: registrations && registrations.length > 0 ? registrations[0] : null,
      };
    });

    return {
      events: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEventBySlug(slug: string, currentUserId?: string) {
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            logo: true,
            banner: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            registrations: true,
            attendances: true,
          },
        },
        registrations: currentUserId
          ? {
              where: { userId: currentUserId },
              select: {
                id: true,
                status: true,
                qrToken: true,
                waitlistPosition: true,
              },
            }
          : false,
      },
    });

    if (!event) {
      throw new NotFoundError(`Event with slug '${slug}' not found`);
    }

    const { registrations, ...rest } = event as any;
    return {
      ...rest,
      userRegistration: registrations && registrations.length > 0 ? registrations[0] : null,
    };
  }

  async createEvent(userId: string, userRole: Role, input: CreateEventInput) {
    // Check user permission (Admin OR Lead of the target club)
    if (userRole !== Role.ADMIN) {
      const membership = await prisma.clubMember.findUnique({
        where: {
          clubId_userId: {
            clubId: input.clubId,
            userId,
          },
        },
      });

      if (!membership || (membership.role !== ClubMemberRole.LEAD && membership.role !== ClubMemberRole.CO_LEAD)) {
        throw new ForbiddenError('You must be a club lead or administrator to propose events for this club');
      }
    }

    // Check for Venue Conflict (overlapping approved event in same venue)
    const venueConflict = await prisma.event.findFirst({
      where: {
        venue: { equals: input.venue.trim(), mode: 'insensitive' },
        status: EventStatus.APPROVED,
        AND: [
          { startDateTime: { lt: new Date(input.endDateTime) } },
          { endDateTime: { gt: new Date(input.startDateTime) } },
        ],
      },
    });

    if (venueConflict) {
      throw new ConflictError(
        `Venue conflict: '${venueConflict.title}' is already scheduled at ${input.venue} during that time window.`
      );
    }

    let slug = slugify(input.title);
    const slugCollision = await prisma.event.findUnique({ where: { slug } });
    if (slugCollision) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // If Admin creates it, default to APPROVED; if Organizer creates it, PENDING_APPROVAL
    const initialStatus = userRole === Role.ADMIN ? EventStatus.APPROVED : (input.status || EventStatus.PENDING_APPROVAL);

    const event = await prisma.event.create({
      data: {
        clubId: input.clubId,
        createdById: userId,
        title: input.title.trim(),
        slug,
        description: input.description.trim(),
        category: input.category.trim(),
        venue: input.venue.trim(),
        startDateTime: new Date(input.startDateTime),
        endDateTime: new Date(input.endDateTime),
        capacity: input.capacity,
        registrationDeadline: new Date(input.registrationDeadline),
        bannerUrl: input.bannerUrl,
        status: initialStatus,
      },
      include: {
        club: { select: { name: true, slug: true } },
      },
    });

    return event;
  }

  async updateEvent(eventId: string, userId: string, userRole: Role, input: UpdateEventInput) {
    const existing = await prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!existing) {
      throw new NotFoundError('Event not found');
    }

    if (userRole !== Role.ADMIN && existing.createdById !== userId) {
      const membership = await prisma.clubMember.findUnique({
        where: {
          clubId_userId: {
            clubId: existing.clubId,
            userId,
          },
        },
      });
      if (!membership || (membership.role !== ClubMemberRole.LEAD && membership.role !== ClubMemberRole.CO_LEAD)) {
        throw new ForbiddenError('You lack permissions to modify this event');
      }
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: input.title?.trim(),
        description: input.description?.trim(),
        category: input.category?.trim(),
        venue: input.venue?.trim(),
        startDateTime: input.startDateTime ? new Date(input.startDateTime) : undefined,
        endDateTime: input.endDateTime ? new Date(input.endDateTime) : undefined,
        capacity: input.capacity,
        registrationDeadline: input.registrationDeadline ? new Date(input.registrationDeadline) : undefined,
        bannerUrl: input.bannerUrl,
        status: input.status,
      },
    });

    return updated;
  }

  async moderateEvent(eventId: string, input: AdminModerateEventInput) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { createdBy: true },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: input.status,
        rejectionReason: input.status === EventStatus.REJECTED ? input.rejectionReason : null,
      },
    });

    // Notify event organizer
    await notificationService.createNotification({
      userId: event.createdById,
      title: input.status === EventStatus.APPROVED ? 'Event Approved!' : 'Event Proposal Rejected',
      message:
        input.status === EventStatus.APPROVED
          ? `Your event proposal "${event.title}" has been approved and is now live!`
          : `Your event proposal "${event.title}" was rejected. Reason: ${input.rejectionReason}`,
      type: NotificationType.APPROVAL,
      link: `/events/${event.slug}`,
    });

    // Dispatch email
    await emailService.sendEventStatusUpdateEmail(event.createdBy.email, {
      organizerName: event.createdBy.name,
      eventTitle: event.title,
      status: input.status,
      reason: input.rejectionReason,
    });

    return updated;
  }

  async getAdminQueue() {
    return prisma.event.findMany({
      where: { status: EventStatus.PENDING_APPROVAL },
      orderBy: { createdAt: 'desc' },
      include: {
        club: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, name: true, email: true, department: true } },
      },
    });
  }
}

export const eventService = new EventService();
