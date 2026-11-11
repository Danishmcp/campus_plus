import { authService } from '../services/auth.service.js';
export class AuthController {
    async register(req, res, next) {
        try {
            const result = await authService.register(req.body);
            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const result = await authService.login(req.body);
            res.status(200).json({
                success: true,
                message: 'Signed in successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await authService.refreshToken(refreshToken);
            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            if (req.user?.id) {
                await authService.logout(req.user.id);
            }
            res.status(200).json({
                success: true,
                message: 'Signed out successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getMe(req, res, next) {
        try {
            const user = await authService.getMe(req.user.id);
            res.status(200).json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const updated = await authService.updateProfile(req.user.id, req.body);
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: { user: updated },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            const result = await authService.changePassword(req.user.id, req.body);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export const authController = new AuthController();
