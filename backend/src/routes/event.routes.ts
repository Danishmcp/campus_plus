import { Router } from 'express';
import { eventController } from '../controllers/event.controller.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadBanner } from '../config/multer.js';
import {
  createEventSchema,
  updateEventSchema,
  adminModerateEventSchema,
} from '../validators/event.validator.js';
import { Role } from '@prisma/client';

const router = Router();

// Public discovery
router.get('/', eventController.listEvents.bind(eventController));
router.get('/queue/pending', authenticate, requireRoles(Role.ADMIN), eventController.getAdminQueue.bind(eventController));
router.get('/:slug', eventController.getEventBySlug.bind(eventController));

// Create event (Organizer or Admin)
router.post(
  '/',
  authenticate,
  requireRoles(Role.ADMIN, Role.ORGANIZER),
  uploadBanner.single('banner'),
  validate({ body: createEventSchema }),
  eventController.createEvent.bind(eventController)
);

// Update event
router.put(
  '/:id',
  authenticate,
  requireRoles(Role.ADMIN, Role.ORGANIZER),
  uploadBanner.single('banner'),
  validate({ body: updateEventSchema }),
  eventController.updateEvent.bind(eventController)
);

// Moderate event (Admin only: Approve/Reject)
router.patch(
  '/:id/moderate',
  authenticate,
  requireRoles(Role.ADMIN),
  validate({ body: adminModerateEventSchema }),
  eventController.moderateEvent.bind(eventController)
);

export default router;
