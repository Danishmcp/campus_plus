import { eventService } from '../services/event.service.js';
export class EventController {
    async listEvents(req, res, next) {
        try {
            const { search, category, clubSlug, status, timeFilter, page, limit } = req.query;
            const result = await eventService.listEvents({
                search: search,
                category: category,
                clubSlug: clubSlug,
                status: status,
                timeFilter: timeFilter,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                currentUserId: req.user?.id,
            });
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getEventBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const event = await eventService.getEventBySlug(slug, req.user?.id);
            res.status(200).json({
                success: true,
                data: { event },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async createEvent(req, res, next) {
        try {
            const input = req.body;
            // If banner file was uploaded via Multer (in-memory buffer converted to data URL)
            if (req.file) {
                input.bannerUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            }
            const event = await eventService.createEvent(req.user.id, req.user.role, input);
            res.status(201).json({
                success: true,
                message: 'Event submitted successfully',
                data: { event },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateEvent(req, res, next) {
        try {
            const { id } = req.params;
            const input = req.body;
            if (req.file) {
                input.bannerUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            }
            const event = await eventService.updateEvent(id, req.user.id, req.user.role, input);
            res.status(200).json({
                success: true,
                message: 'Event updated successfully',
                data: { event },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async moderateEvent(req, res, next) {
        try {
            const { id } = req.params;
            const event = await eventService.moderateEvent(id, req.body);
            res.status(200).json({
                success: true,
                message: `Event has been ${event.status.toLowerCase()}`,
                data: { event },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAdminQueue(req, res, next) {
        try {
            const queue = await eventService.getAdminQueue();
            res.status(200).json({
                success: true,
                data: { queue },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export const eventController = new EventController();
