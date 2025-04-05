import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/role';
import { UserProfile } from '../services/authService';
import { ApiError } from '../utils/apiError';

// Extend UserProfile to include companyId
interface ExtendedUserProfile extends UserProfile {
  companyId?: string;
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
 * Middleware to check if the user belongs to the same company or has a higher role
 */
export const requireSameCompanyOrHigherRole = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
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

  // APP_OWNER can access everything
  if (UserRole[userRole] === UserRole.APP_OWNER) {
    next();
    return;
  }

  // Get the target company ID from the request
  const targetCompanyId = req.body.companyId || req.params.companyId;

  // SUPER_USER can only access their own company
  if (UserRole[userRole] === UserRole.SUPER_USER) {
    if (!user.companyId) {
      next(ApiError.forbidden('User company not assigned'));
      return;
    }

    if (!targetCompanyId) {
      next(ApiError.badRequest('Target company not specified'));
      return;
    }

    if (user.companyId !== targetCompanyId) {
      next(ApiError.forbidden('Access denied: Different company'));
      return;
    }
  }

  next();
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

  if (user.status !== 'active') {
    next(ApiError.forbidden('User account is inactive'));
    return;
  }

  next();
}; 