import { prisma } from '../config/db.js';
import { RegistrationStatus } from '@prisma/client';
export class AnalyticsService {
    async getAdminPlatformAnalytics() {
        const [totalUsers, totalClubs, totalEvents, totalRegistrations, totalAttendances, totalCertificates,] = await Promise.all([
            prisma.user.count(),
            prisma.club.count(),
            prisma.event.count(),
            prisma.registration.count({ where: { status: RegistrationStatus.CONFIRMED } }),
            prisma.attendance.count(),
            prisma.certificate.count(),
        ]);
        const usersByRole = await prisma.user.groupBy({
            by: ['role'],
            _count: { id: true },
        });
        const eventsByStatus = await prisma.event.groupBy({
            by: ['status'],
            _count: { id: true },
        });
        const attendanceRate = totalRegistrations > 0
            ? Math.round((totalAttendances / totalRegistrations) * 100)
            : 0;
        // Category distribution for events
        const categoryStats = await prisma.event.groupBy({
            by: ['category'],
            _count: { id: true },
        });
        const formattedCategoryStats = categoryStats.map((c) => ({
            name: c.category,
            count: c._count.id,
        }));
        // Recent 5 events with activity
        const recentEvents = await prisma.event.findMany({
            take: 6,
            orderBy: { createdAt: 'desc' },
            include: {
                club: { select: { name: true } },
                _count: {
                    select: {
                        registrations: true,
                        attendances: true,
                    },
                },
            },
        });
        return {
            totals: {
                users: totalUsers,
                clubs: totalClubs,
                events: totalEvents,
                registrations: totalRegistrations,
                attendances: totalAttendances,
                certificates: totalCertificates,
                attendanceRate: `${attendanceRate}%`,
            },
            usersByRole: usersByRole.map((u) => ({ role: u.role, count: u._count.id })),
            eventsByStatus: eventsByStatus.map((e) => ({ status: e.status, count: e._count.id })),
            categoryStats: formattedCategoryStats,
            recentEvents,
        };
    }
    async getOrganizerClubAnalytics(userId) {
        // Find clubs user leads
        const memberships = await prisma.clubMember.findMany({
            where: {
                userId,
                role: { in: ['LEAD', 'CO_LEAD'] },
            },
            include: {
                club: {
                    include: {
                        events: {
                            include: {
                                _count: {
                                    select: {
                                        registrations: true,
                                        attendances: true,
                                        certificates: true,
                                    },
                                },
                            },
                            orderBy: { startDateTime: 'desc' },
                        },
                        _count: {
                            select: {
                                members: true,
                                events: true,
                            },
                        },
                    },
                },
            },
        });
        const clubs = memberships.map((m) => m.club);
        let totalClubEvents = 0;
        let totalClubRegistrations = 0;
        let totalClubAttendees = 0;
        clubs.forEach((c) => {
            totalClubEvents += c.events.length;
            c.events.forEach((e) => {
                totalClubRegistrations += e._count.registrations;
                totalClubAttendees += e._count.attendances;
            });
        });
        const attendanceRate = totalClubRegistrations > 0
            ? Math.round((totalClubAttendees / totalClubRegistrations) * 100)
            : 0;
        return {
            clubs,
            totals: {
                clubsCount: clubs.length,
                eventsCount: totalClubEvents,
                registrationsCount: totalClubRegistrations,
                attendeesCount: totalClubAttendees,
                attendanceRate: `${attendanceRate}%`,
            },
        };
    }
}
export const analyticsService = new AnalyticsService();
