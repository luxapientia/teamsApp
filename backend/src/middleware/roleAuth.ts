import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/user';
import { UserProfile } from '../types';
import { ApiError } from '../utils/apiError';
// Extend UserProfile to include role
interface ExtendedUserProfile extends Omit<UserProfile, 'role'> {
  role: string;
}

// Update AuthenticatedRequest to use ExtendedUserProfile and export it
export interface AuthenticatedRequest extends Request {
  user?: ExtendedUserProfile;
}

/**
 * Middleware to check if the user has the required role(s)
 * @param allowedRoles Array of roles that are allowed to access the route
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      next(ApiError.unauthorized('User not authenticated'));
      return;
    }

    // Convert string role to UserRole enum
    const userRole = user.role as keyof typeof UserRole;
    if (!userRole || !UserRole[userRole]) {
      next(ApiError.forbidden('Invalid user role'));
      return;
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(UserRole[userRole])) {
      next(ApiError.forbidden('Insufficient permissions'));
      return;
    }

    // Check user status
    if (user.status !== 'active') {
      next(ApiError.forbidden('User account is inactive'));
      return;
    }

    next();
  };
};

/**
 * Middleware to ensure user is active
 */
export const requireActiveStatus = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const user = req.user;

  if (!user) {
    next(ApiError.unauthorized('User not authenticated'));
    return;
  }

  if (user.role === UserRole.SUPER_USER && user.status !== 'active') {
    next(ApiError.forbidden('User account is inactive'));
    return;
  }

  next();
}; 