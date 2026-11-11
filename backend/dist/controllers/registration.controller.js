import { registrationService } from '../services/registration.service.js';
export class RegistrationController {
    async register(req, res, next) {
        try {
            const { eventId } = req.body;
            const result = await registrationService.registerForEvent(req.user.id, eventId);
            res.status(201).json({
                success: true,
                message: result.registration.status === 'CONFIRMED'
                    ? 'Event registration confirmed!'
                    : `Added to waitlist (#${result.registration.waitlistPosition})`,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async cancel(req, res, next) {
        try {
            const { id } = req.params;
            const result = await registrationService.cancelRegistration(req.user.id, id);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getMyRegistrations(req, res, next) {
        try {
            const registrations = await registrationService.getUserRegistrations(req.user.id);
            res.status(200).json({
                success: true,
                data: { registrations },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getEventRegistrations(req, res, next) {
        try {
            const { eventId } = req.params;
            const registrations = await registrationService.getEventRegistrations(eventId);
            res.status(200).json({
                success: true,
                data: { registrations },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export const registrationController = new RegistrationController();
