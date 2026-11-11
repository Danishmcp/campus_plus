import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from '../validators/auth.validator.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from '../utils/errors.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/jwt.js';
import { Role } from '@prisma/client';

export class AuthService {
  async register(input: RegisterInput) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (existingEmail) {
      throw new ConflictError('An account with this email address already exists');
    }

    if (input.rollNumber) {
      const existingRoll = await prisma.user.findUnique({
        where: { rollNumber: input.rollNumber.trim() },
      });
      if (existingRoll) {
        throw new ConflictError('An account with this roll number already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: input.email.toLowerCase().trim(),
        password: hashedPassword,
        department: input.department?.trim(),
        rollNumber: input.rollNumber?.trim(),
        role: input.role || Role.STUDENT,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        rollNumber: true,
        avatar: true,
        createdAt: true,
      },
    });

    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken({ id: user.id });

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { user, accessToken, refreshToken };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken({ id: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        rollNumber: user.rollNumber,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    let decoded: { id: string };
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== token) {
      throw new UnauthorizedError('Refresh token revoked or invalid');
    }

    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken({ id: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        rollNumber: true,
        avatar: true,
        createdAt: true,
        clubMemberships: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                slug: true,
                category: true,
                logo: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    if (input.rollNumber) {
      const existingRoll = await prisma.user.findFirst({
        where: {
          rollNumber: input.rollNumber.trim(),
          NOT: { id: userId },
        },
      });
      if (existingRoll) {
        throw new ConflictError('Roll number already assigned to another user');
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name?.trim(),
        department: input.department?.trim(),
        rollNumber: input.rollNumber?.trim(),
        avatar: input.avatar,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        rollNumber: true,
        avatar: true,
        createdAt: true,
      },
    });

    return updated;
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await bcrypt.compare(input.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestError('Current password is incorrect');
    }

    const newHashed = await bcrypt.hash(input.newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: newHashed,
        refreshToken: null, // Revoke current refresh tokens on password change
      },
    });

    return { message: 'Password updated successfully. Please sign in again.' };
  }
}

export const authService = new AuthService();
