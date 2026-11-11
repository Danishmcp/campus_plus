import { prisma } from '../config/db.js';
import { NotificationType } from '@prisma/client';
export class NotificationService {
    async createNotification(params) {
        return prisma.notification.create({
            data: {
                userId: params.userId,
                title: params.title,
                message: params.message,
                type: params.type || NotificationType.SYSTEM,
                link: params.link,
                metadata: params.metadata,
            },
        });
    }
    async getUserNotifications(userId) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async getUnreadCount(userId) {
        return prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
    }
    async markAsRead(id, userId) {
        return prisma.notification.updateMany({
            where: {
                id,
                userId,
            },
            data: {
                isRead: true,
            },
        });
    }
    async markAllAsRead(userId) {
        return prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });
    }
}
export const notificationService = new NotificationService();
