import { attendanceService } from '../services/attendance.service.js';
export class AttendanceController {
    async scanQR(req, res, next) {
        try {
            const { eventId, qrToken } = req.body;
            const attendance = await attendanceService.markAttendanceViaQR(req.user.id, eventId, qrToken);
            res.status(200).json({
                success: true,
                message: `Attendance verified! Welcome, ${attendance.user.name}.`,
                data: { attendance },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async manualCheckIn(req, res, next) {
        try {
            const { eventId, studentIdentifier } = req.body;
            const attendance = await attendanceService.markAttendanceManual(req.user.id, eventId, studentIdentifier);
            res.status(200).json({
                success: true,
                message: `Manual attendance recorded for ${attendance.user.name}.`,
                data: { attendance },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAttendees(req, res, next) {
        try {
            const { eventId } = req.params;
            const attendees = await attendanceService.getEventAttendees(eventId);
            res.status(200).json({
                success: true,
                data: { attendees },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async exportCSV(req, res, next) {
        try {
            const { eventId } = req.params;
            const csv = await attendanceService.exportAttendeesCSV(eventId);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="attendance-event-${eventId}.csv"`);
            res.status(200).send(csv);
        }
        catch (error) {
            next(error);
        }
    }
}
export const attendanceController = new AttendanceController();
