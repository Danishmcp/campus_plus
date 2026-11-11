import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { scanQRSchema, manualAttendanceSchema } from '../validators/attendance.validator.js';
import { Role } from '@prisma/client';
const router = Router();
// Only Organizers & Admins can access attendance tools
router.use(authenticate);
router.use(requireRoles(Role.ADMIN, Role.ORGANIZER));
router.post('/scan', validate({ body: scanQRSchema }), attendanceController.scanQR.bind(attendanceController));
router.post('/manual', validate({ body: manualAttendanceSchema }), attendanceController.manualCheckIn.bind(attendanceController));
router.get('/event/:eventId', attendanceController.getAttendees.bind(attendanceController));
router.get('/event/:eventId/export', attendanceController.exportCSV.bind(attendanceController));
export default router;
