import { z } from 'zod';
import { Role } from '@prisma/client';
export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    department: z.string().max(100).optional(),
    rollNumber: z.string().max(50).optional(),
    role: z.nativeEnum(Role).optional().default(Role.STUDENT),
});
export const loginSchema = z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(1, 'Password is required'),
});
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});
export const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    department: z.string().max(100).optional(),
    rollNumber: z.string().max(50).optional(),
    avatar: z.string().url().optional().or(z.literal('')),
});
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});
