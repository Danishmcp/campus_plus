import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Admin platform analytics
router.get(
  '/admin',
  requireRoles(Role.ADMIN),
  analyticsController.getAdminAnalytics.bind(analyticsController)
);

// Organizer club analytics
router.get(
  '/organizer',
  requireRoles(Role.ADMIN, Role.ORGANIZER),
  analyticsController.getOrganizerAnalytics.bind(analyticsController)
);

export default router;
