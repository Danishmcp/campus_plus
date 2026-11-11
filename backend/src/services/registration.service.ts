import { prisma } from '../config/db.js';
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
} from '../utils/errors.js';
import { RegistrationStatus, EventStatus, NotificationType } from '@prisma/client';
import { createSignedQRToken } from '../utils/qr.js';
import { notificationService } from './notification.service.js';
import { emailService } from '../utils/email.js';
import crypto from 'crypto';

export class RegistrationService {
  async registerForEvent(userId: string, eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: { select: { name: true } },
      },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event.status !== EventStatus.APPROVED) {
      throw new BadRequestError(`Cannot register: Event is currently ${event.status.toLowerCase()}`);
    }

    const now = new Date();
    if (new Date(event.registrationDeadline) < now) {
      throw new BadRequestError('Registration deadline has passed for this event');
    }

    // Check duplicate active registration
    const existing = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existing && existing.status !== RegistrationStatus.CANCELLED) {
      throw new ConflictError(`You are already registered for this event (Status: ${existing.status})`);
    }

    // Check for Schedule Clash (overlapping confirmed events for this user)
    const conflictingRegistrations = await prisma.registration.findMany({
      where: {
        userId,
        status: RegistrationStatus.CONFIRMED,
        event: {
          id: { not: eventId },
          status: EventStatus.APPROVED,
          AND: [
            { startDateTime: { lt: event.endDateTime } },
            { endDateTime: { gt: event.startDateTime } },
          ],
        },
      },
      include: {
        event: { select: { title: true, startDateTime: true, endDateTime: true } },
      },
    });

    let warning: string | null = null;
    if (conflictingRegistrations.length > 0) {
      const clash = conflictingRegistrations[0].event;
      warning = `Schedule Warning: This event overlaps with '${clash.title}'.`;
    }

    // Count confirmed registrations
    const confirmedCount = await prisma.registration.count({
      where: {
        eventId,
        status: RegistrationStatus.CONFIRMED,
      },
    });

    const isWaitlist = confirmedCount >= event.capacity;
    let waitlistPosition: number | null = null;
    let status: RegistrationStatus = RegistrationStatus.CONFIRMED;

    if (isWaitlist) {
      status = RegistrationStatus.WAITLISTED;
      const waitlistCount = await prisma.registration.count({
        where: {
          eventId,
          status: RegistrationStatus.WAITLISTED,
        },
      });
      waitlistPosition = waitlistCount + 1;
    }

    const tempToken = `TEMP-${crypto.randomUUID()}`;

    // Create or reactivate registration
    let registration;
    if (existing) {
      registration = await prisma.registration.update({
        where: { id: existing.id },
        data: {
          status,
          waitlistPosition,
          registeredAt: new Date(),
          cancelledAt: null,
          qrToken: tempToken,
        },
        include: { user: true, event: true },
      });
    } else {
      registration = await prisma.registration.create({
        data: {
          eventId,
          userId,
          status,
          waitlistPosition,
          qrToken: tempToken,
        },
        include: { user: true, event: true },
      });
    }

    // Sign cryptographic QR token
    const signedQr = createSignedQRToken({
      registrationId: registration.id,
      eventId: event.id,
      userId,
    });

    registration = await prisma.registration.update({
      where: { id: registration.id },
      data: { qrToken: signedQr },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            venue: true,
            startDateTime: true,
            endDateTime: true,
          },
        },
      },
    });

    // Notify user
    const title = isWaitlist ? 'Added to Event Waitlist' : 'Event Registration Confirmed!';
    const message = isWaitlist
      ? `You are #${waitlistPosition} on the waitlist for "${event.title}". You will be automatically enrolled if a seat opens.`
      : `You're in! Your seat is confirmed for "${event.title}". Check your dashboard for your QR ticket.`;

    await notificationService.createNotification({
      userId,
      title,
      message,
      type: isWaitlist ? NotificationType.WAITLIST : NotificationType.REGISTRATION,
      link: `/events/${event.slug}`,
    });

    // Send confirmation email if confirmed
    if (!isWaitlist) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        await emailService.sendRegistrationEmail(user.email, {
          name: user.name,
          eventTitle: event.title,
          venue: event.venue,
          date: new Date(event.startDateTime).toLocaleString(),
        });
      }
    }

    return {
      registration,
      warning,
    };
  }

  async cancelRegistration(userId: string, registrationId: string) {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { event: true },
    });

    if (!registration || registration.userId !== userId) {
      throw new NotFoundError('Registration ticket not found');
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new BadRequestError('Registration is already cancelled');
    }

    const wasConfirmed = registration.status === RegistrationStatus.CONFIRMED;

    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: RegistrationStatus.CANCELLED,
        cancelledAt: new Date(),
        waitlistPosition: null,
      },
    });

    // Waitlist Auto-Promotion Engine
    if (wasConfirmed) {
      const nextInLine = await prisma.registration.findFirst({
        where: {
          eventId: registration.eventId,
          status: RegistrationStatus.WAITLISTED,
        },
        orderBy: { registeredAt: 'asc' },
        include: { user: true, event: true },
      });

      if (nextInLine) {
        // Promote nextInLine to CONFIRMED
        const newQr = createSignedQRToken({
          registrationId: nextInLine.id,
          eventId: nextInLine.eventId,
          userId: nextInLine.userId,
        });

        await prisma.registration.update({
          where: { id: nextInLine.id },
          data: {
            status: RegistrationStatus.CONFIRMED,
            waitlistPosition: null,
            qrToken: newQr,
          },
        });

        // Recalculate positions for remaining waitlisted students
        const remainingWaitlist = await prisma.registration.findMany({
          where: {
            eventId: registration.eventId,
            status: RegistrationStatus.WAITLISTED,
          },
          orderBy: { registeredAt: 'asc' },
        });

        for (let i = 0; i < remainingWaitlist.length; i++) {
          await prisma.registration.update({
            where: { id: remainingWaitlist[i].id },
            data: { waitlistPosition: i + 1 },
          });
        }

        // Notify promoted student
        await notificationService.createNotification({
          userId: nextInLine.userId,
          title: 'Promoted from Waitlist!',
          message: `Great news! A seat opened up for "${nextInLine.event.title}" and your registration is now CONFIRMED.`,
          type: NotificationType.WAITLIST,
          link: `/events/${nextInLine.event.slug}`,
        });

        await emailService.sendWaitlistPromotionEmail(nextInLine.user.email, {
          name: nextInLine.user.name,
          eventTitle: nextInLine.event.title,
        });
      }
    }

    return { message: 'Registration cancelled successfully' };
  }

  async getUserRegistrations(userId: string) {
    return prisma.registration.findMany({
      where: { userId },
      orderBy: { registeredAt: 'desc' },
      include: {
        event: {
          include: {
            club: { select: { name: true, slug: true, logo: true } },
          },
        },
        attendance: true,
      },
    });
  }

  async getEventRegistrations(eventId: string) {
    return prisma.registration.findMany({
      where: { eventId },
      orderBy: [{ status: 'asc' }, { registeredAt: 'asc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rollNumber: true,
            department: true,
          },
        },
        attendance: true,
      },
    });
  }
}

export const registrationService = new RegistrationService();
