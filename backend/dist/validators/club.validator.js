import { z } from 'zod';
import { ClubMemberRole } from '@prisma/client';
export const createClubSchema = z.object({
    name: z.string().min(2, 'Club name must be at least 2 characters').max(100),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
    category: z.string().min(2).max(50),
    logo: z.string().url().optional().or(z.literal('')),
    banner: z.string().url().optional().or(z.literal('')),
    leadId: z.string().uuid().optional(),
});
export const updateClubSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().min(10).max(2000).optional(),
    category: z.string().min(2).max(50).optional(),
    logo: z.string().url().optional().or(z.literal('')),
    banner: z.string().url().optional().or(z.literal('')),
    leadId: z.string().uuid().nullable().optional(),
    isActive: z.boolean().optional(),
});
export const addMemberSchema = z.object({
    userId: z.string().uuid('Valid user ID required'),
    role: z.nativeEnum(ClubMemberRole).optional().default(ClubMemberRole.MEMBER),
});
export const updateMemberRoleSchema = z.object({
    role: z.nativeEnum(ClubMemberRole),
});
