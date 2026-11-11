import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { eventService } from '../services/event.service.js';
import {
  CreateEventInput,
  UpdateEventInput,
  AdminModerateEventInput,
} from '../validators/event.validator.js';
import { EventStatus, Role } from '@prisma/client';

export class EventController {
  async listEvents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, category, clubSlug, status, timeFilter, page, limit } = req.query;
      const result = await eventService.listEvents({
        search: search as string,
        category: category as string,
        clubSlug: clubSlug as string,
        status: status as EventStatus,
        timeFilter: timeFilter as 'upcoming' | 'past' | 'all',
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        currentUserId: req.user?.id,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEventBySlug(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const event = await eventService.getEventBySlug(slug, req.user?.id);
      res.status(200).json({
        success: true,
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  }

  async createEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateEventInput;
      // If banner file was uploaded via Multer (in-memory buffer converted to data URL)
      if (req.file) {
        input.bannerUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }

      const event = await eventService.createEvent(
        req.user!.id,
        req.user!.role as Role,
        input
      );

      res.status(201).json({
        success: true,
        message: 'Event submitted successfully',
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input = req.body as UpdateEventInput;
      if (req.file) {
        input.bannerUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }

      const event = await eventService.updateEvent(
        id,
        req.user!.id,
        req.user!.role as Role,
        input
      );

      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  }

  async moderateEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const event = await eventService.moderateEvent(
        id,
        req.body as AdminModerateEventInput
      );

      res.status(200).json({
        success: true,
        message: `Event has been ${event.status.toLowerCase()}`,
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdminQueue(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const queue = await eventService.getAdminQueue();
      res.status(200).json({
        success: true,
        data: { queue },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const eventController = new EventController();
