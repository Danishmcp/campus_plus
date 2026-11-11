import { Router } from 'express';
import { clubController } from '../controllers/club.controller.js';
import { authenticate, requireRoles, requireClubLeadOrAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createClubSchema,
  updateClubSchema,
  addMemberSchema,
} from '../validators/club.validator.js';
import { Role } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', clubController.getAllClubs.bind(clubController));
router.get('/:slug', clubController.getClubBySlug.bind(clubController));
router.get('/:id/members', clubController.getClubMembers.bind(clubController));

// Admin only: create & delete club
router.post(
  '/',
  authenticate,
  requireRoles(Role.ADMIN),
  validate({ body: createClubSchema }),
  clubController.createClub.bind(clubController)
);

router.delete(
  '/:id',
  authenticate,
  requireRoles(Role.ADMIN),
  clubController.deleteClub.bind(clubController)
);

// Admin or Club Lead: update club details
router.put(
  '/:id',
  authenticate,
  requireClubLeadOrAdmin((req) => req.params.id),
  validate({ body: updateClubSchema }),
  clubController.updateClub.bind(clubController)
);

// Admin or Club Lead: manage club members
router.post(
  '/:id/members',
  authenticate,
  requireClubLeadOrAdmin((req) => req.params.id),
  validate({ body: addMemberSchema }),
  clubController.addMember.bind(clubController)
);

router.delete(
  '/:id/members/:userId',
  authenticate,
  requireClubLeadOrAdmin((req) => req.params.id),
  clubController.removeMember.bind(clubController)
);

export default router;
