import { prisma } from '../config/db.js';
import { ConflictError, NotFoundError, } from '../utils/errors.js';
import { ClubMemberRole, Role } from '@prisma/client';
function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
export class ClubService {
    async getAllClubs(params) {
        const where = {};
        if (params.isActive !== undefined) {
            where.isActive = params.isActive;
        }
        if (params.category && params.category !== 'All') {
            where.category = {
                equals: params.category,
                mode: 'insensitive',
            };
        }
        if (params.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } },
                { category: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        const clubs = await prisma.club.findMany({
            where,
            orderBy: { name: 'asc' },
            include: {
                lead: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        department: true,
                    },
                },
                _count: {
                    select: {
                        members: true,
                        events: true,
                    },
                },
            },
        });
        return clubs;
    }
    async getClubBySlug(slug) {
        const club = await prisma.club.findUnique({
            where: { slug },
            include: {
                lead: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        department: true,
                        avatar: true,
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                department: true,
                                rollNumber: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: { role: 'asc' },
                },
                events: {
                    where: {
                        status: { in: ['APPROVED', 'COMPLETED'] },
                    },
                    orderBy: { startDateTime: 'asc' },
                    include: {
                        _count: {
                            select: {
                                registrations: true,
                                attendances: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        members: true,
                        events: true,
                    },
                },
            },
        });
        if (!club) {
            throw new NotFoundError(`Club with slug '${slug}' not found`);
        }
        const now = new Date();
        const upcomingEvents = club.events.filter((e) => new Date(e.endDateTime) >= now);
        const pastEvents = club.events.filter((e) => new Date(e.endDateTime) < now);
        return {
            ...club,
            upcomingEvents,
            pastEvents,
        };
    }
    async getClubById(id) {
        const club = await prisma.club.findUnique({
            where: { id },
            include: {
                lead: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        if (!club) {
            throw new NotFoundError('Club not found');
        }
        return club;
    }
    async createClub(input) {
        const slug = input.slug || slugify(input.name);
        const existingName = await prisma.club.findUnique({
            where: { name: input.name.trim() },
        });
        if (existingName) {
            throw new ConflictError('A club with this name already exists');
        }
        const existingSlug = await prisma.club.findUnique({
            where: { slug },
        });
        if (existingSlug) {
            throw new ConflictError('A club with this URL slug already exists');
        }
        if (input.leadId) {
            const user = await prisma.user.findUnique({
                where: { id: input.leadId },
            });
            if (!user) {
                throw new NotFoundError('Assigned club lead user not found');
            }
        }
        const club = await prisma.club.create({
            data: {
                name: input.name.trim(),
                slug,
                description: input.description.trim(),
                category: input.category.trim(),
                logo: input.logo,
                banner: input.banner,
                leadId: input.leadId,
                members: input.leadId
                    ? {
                        create: {
                            userId: input.leadId,
                            role: ClubMemberRole.LEAD,
                        },
                    }
                    : undefined,
            },
            include: {
                lead: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        // Ensure the lead user has role ORGANIZER if currently STUDENT
        if (input.leadId) {
            await prisma.user.updateMany({
                where: {
                    id: input.leadId,
                    role: Role.STUDENT,
                },
                data: {
                    role: Role.ORGANIZER,
                },
            });
        }
        return club;
    }
    async updateClub(id, input) {
        await this.getClubById(id);
        if (input.name) {
            const existing = await prisma.club.findFirst({
                where: {
                    name: input.name.trim(),
                    NOT: { id },
                },
            });
            if (existing) {
                throw new ConflictError('Another club already uses this name');
            }
        }
        const updated = await prisma.club.update({
            where: { id },
            data: {
                name: input.name?.trim(),
                description: input.description?.trim(),
                category: input.category?.trim(),
                logo: input.logo,
                banner: input.banner,
                leadId: input.leadId,
                isActive: input.isActive,
            },
            include: {
                lead: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        if (input.leadId) {
            // Upsert leadership in ClubMember
            await prisma.clubMember.upsert({
                where: {
                    clubId_userId: {
                        clubId: id,
                        userId: input.leadId,
                    },
                },
                create: {
                    clubId: id,
                    userId: input.leadId,
                    role: ClubMemberRole.LEAD,
                },
                update: {
                    role: ClubMemberRole.LEAD,
                },
            });
            // Elevate user role if STUDENT
            await prisma.user.updateMany({
                where: {
                    id: input.leadId,
                    role: Role.STUDENT,
                },
                data: {
                    role: Role.ORGANIZER,
                },
            });
        }
        return updated;
    }
    async deleteClub(id) {
        await this.getClubById(id);
        await prisma.club.delete({
            where: { id },
        });
        return { message: 'Club removed successfully' };
    }
    async addMember(clubId, input) {
        await this.getClubById(clubId);
        const user = await prisma.user.findUnique({
            where: { id: input.userId },
        });
        if (!user) {
            throw new NotFoundError('User not found');
        }
        const existingMember = await prisma.clubMember.findUnique({
            where: {
                clubId_userId: {
                    clubId,
                    userId: input.userId,
                },
            },
        });
        if (existingMember) {
            throw new ConflictError('User is already a member of this club');
        }
        const member = await prisma.clubMember.create({
            data: {
                clubId,
                userId: input.userId,
                role: input.role || ClubMemberRole.MEMBER,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        department: true,
                        rollNumber: true,
                    },
                },
            },
        });
        // If assigned as LEAD or CO_LEAD, promote user to ORGANIZER
        if ((input.role === ClubMemberRole.LEAD || input.role === ClubMemberRole.CO_LEAD) &&
            user.role === Role.STUDENT) {
            await prisma.user.update({
                where: { id: input.userId },
                data: { role: Role.ORGANIZER },
            });
        }
        return member;
    }
    async removeMember(clubId, userId) {
        const member = await prisma.clubMember.findUnique({
            where: {
                clubId_userId: {
                    clubId,
                    userId,
                },
            },
        });
        if (!member) {
            throw new NotFoundError('Member record not found in this club');
        }
        await prisma.clubMember.delete({
            where: {
                clubId_userId: {
                    clubId,
                    userId,
                },
            },
        });
        return { message: 'Member removed from club successfully' };
    }
    async getClubMembers(clubId) {
        await this.getClubById(clubId);
        return prisma.clubMember.findMany({
            where: { clubId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        department: true,
                        rollNumber: true,
                        role: true,
                    },
                },
            },
            orderBy: { joinedAt: 'desc' },
        });
    }
}
export const clubService = new ClubService();
