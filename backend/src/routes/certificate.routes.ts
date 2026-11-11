import { Router } from 'express';
import { certificateController } from '../controllers/certificate.controller.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

// Public certificate verification endpoint!
router.get('/verify/:code', certificateController.verify.bind(certificateController));

// Public certificate PDF download (streams on-the-fly)
router.get('/download/:code', certificateController.download.bind(certificateController));

// Student: get all issued certificates
router.get('/my-certificates', authenticate, certificateController.getMyCertificates.bind(certificateController));

// Organizer / Admin: issue certificates to attendees of an event
router.post(
  '/issue/:eventId',
  authenticate,
  requireRoles(Role.ADMIN, Role.ORGANIZER),
  certificateController.issue.bind(certificateController)
);

export default router;
