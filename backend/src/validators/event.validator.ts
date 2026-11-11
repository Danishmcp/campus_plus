import { z } from 'zod';
import { EventStatus } from '@prisma/client';

export const createEventSchema = z.object({
  clubId: z.string().uuid('Valid Club ID required'),
  title: z.string().min(3, 'Event title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(2).max(50),
  venue: z.string().min(2, 'Venue is required').max(100),
  startDateTime: z.string().datetime('Valid start datetime required'),
  endDateTime: z.string().datetime('Valid end datetime required'),
  capacity: z.coerce.number().int().positive('Capacity must be at least 1'),
  registrationDeadline: z.string().datetime('Valid registration deadline required'),
  bannerUrl: z.string().optional().or(z.literal('')),
  status: z.nativeEnum(EventStatus).optional().default(EventStatus.PENDING_APPROVAL),
}).refine((data) => new Date(data.endDateTime) > new Date(data.startDateTime), {
  message: 'End date and time must be after the start date and time',
  path: ['endDateTime'],
}).refine((data) => new Date(data.registrationDeadline) <= new Date(data.startDateTime), {
  message: 'Registration deadline cannot be after the event starts',
  path: ['registrationDeadline'],
});

export const updateEventSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  category: z.string().min(2).max(50).optional(),
  venue: z.string().min(2).max(100).optional(),
  startDateTime: z.string().datetime().optional(),
  endDateTime: z.string().datetime().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  registrationDeadline: z.string().datetime().optional(),
  bannerUrl: z.string().optional().or(z.literal('')),
  status: z.nativeEnum(EventStatus).optional(),
});

export const adminModerateEventSchema = z.object({
  status: z.enum([EventStatus.APPROVED, EventStatus.REJECTED]),
  rejectionReason: z.string().max(500).optional(),
}).refine(
  (data) => data.status !== EventStatus.REJECTED || (data.rejectionReason && data.rejectionReason.length > 0),
  {
    message: 'A rejection reason is required when rejecting an event proposal',
    path: ['rejectionReason'],
  }
);

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type AdminModerateEventInput = z.infer<typeof adminModerateEventSchema>;
