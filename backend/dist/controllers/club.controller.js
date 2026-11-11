import { clubService } from '../services/club.service.js';
export class ClubController {
    async getAllClubs(req, res, next) {
        try {
            const { category, search, isActive } = req.query;
            const clubs = await clubService.getAllClubs({
                category: category,
                search: search,
                isActive: isActive !== undefined ? isActive === 'true' : undefined,
            });
            res.status(200).json({
                success: true,
                data: { clubs },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getClubBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const club = await clubService.getClubBySlug(slug);
            res.status(200).json({
                success: true,
                data: { club },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async createClub(req, res, next) {
        try {
            const club = await clubService.createClub(req.body);
            res.status(201).json({
                success: true,
                message: 'Club registered successfully',
                data: { club },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateClub(req, res, next) {
        try {
            const { id } = req.params;
            const club = await clubService.updateClub(id, req.body);
            res.status(200).json({
                success: true,
                message: 'Club updated successfully',
                data: { club },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteClub(req, res, next) {
        try {
            const { id } = req.params;
            const result = await clubService.deleteClub(id);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async addMember(req, res, next) {
        try {
            const { id } = req.params;
            const member = await clubService.addMember(id, req.body);
            res.status(201).json({
                success: true,
                message: 'Member added to club successfully',
                data: { member },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async removeMember(req, res, next) {
        try {
            const { id, userId } = req.params;
            const result = await clubService.removeMember(id, userId);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getClubMembers(req, res, next) {
        try {
            const { id } = req.params;
            const members = await clubService.getClubMembers(id);
            res.status(200).json({
                success: true,
                data: { members },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export const clubController = new ClubController();
