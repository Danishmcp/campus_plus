import { Router } from 'express';
import { registrationController } from '../controllers/registration.controller.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerEventSchema } from '../validators/registration.validator.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Student registration
router.post(
  '/',
  validate({ body: registerEventSchema }),
  registrationController.register.bind(registrationController)
);

// Cancel registration
router.delete('/:id', registrationController.cancel.bind(registrationController));

// Get current user's registration tickets
router.get('/my-tickets', registrationController.getMyRegistrations.bind(registrationController));

// Organizer/Admin: view event roster
router.get(
  '/event/:eventId',
  requireRoles(Role.ADMIN, Role.ORGANIZER),
  registrationController.getEventRegistrations.bind(registrationController)
);

export default router;
