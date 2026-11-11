import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { prisma } from '../config/db.js';
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token missing or invalid');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    throw new UnauthorizedError('Session expired or token invalid');
  }
}

export function requireRoles(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ForbiddenError(
        `Action restricted. Allowed roles: ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
}

export function requireClubLeadOrAdmin(clubIdExtractor: (req: AuthenticatedRequest) => string | undefined) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (req.user.role === Role.ADMIN) {
        return next();
      }

      const clubId = clubIdExtractor(req);
      if (!clubId) {
        throw new ForbiddenError('Club ID missing from request');
      }

      // Check if user is LEAD or CO_LEAD of this club
      const membership = await prisma.clubMember.findUnique({
        where: {
          clubId_userId: {
            clubId,
            userId: req.user.id,
          },
        },
      });

      if (!membership || (membership.role !== 'LEAD' && membership.role !== 'CO_LEAD')) {
        throw new ForbiddenError('Only club leaders or platform administrators can perform this action');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
