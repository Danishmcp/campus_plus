import { notificationService } from '../services/notification.service.js';
export class NotificationController {
    async getNotifications(req, res, next) {
        try {
            const notifications = await notificationService.getUserNotifications(req.user.id);
            const unreadCount = await notificationService.getUnreadCount(req.user.id);
            res.status(200).json({
                success: true,
                data: { notifications, unreadCount },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async markAsRead(req, res, next) {
        try {
            const { id } = req.params;
            await notificationService.markAsRead(id, req.user.id);
            res.status(200).json({
                success: true,
                message: 'Notification marked as read',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async markAllAsRead(req, res, next) {
        try {
            await notificationService.markAllAsRead(req.user.id);
            res.status(200).json({
                success: true,
                message: 'All notifications marked as read',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export const notificationController = new NotificationController();
