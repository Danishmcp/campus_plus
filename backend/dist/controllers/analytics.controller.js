import { analyticsService } from '../services/analytics.service.js';
export class AnalyticsController {
    async getAdminAnalytics(_req, res, next) {
        try {
            const data = await analyticsService.getAdminPlatformAnalytics();
            res.status(200).json({
                success: true,
                data,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getOrganizerAnalytics(req, res, next) {
        try {
            const data = await analyticsService.getOrganizerClubAnalytics(req.user.id);
            res.status(200).json({
                success: true,
                data,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export const analyticsController = new AnalyticsController();
