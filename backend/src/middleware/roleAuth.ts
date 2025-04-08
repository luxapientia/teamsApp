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
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      next(ApiError.unauthorized('User not authenticated'));
      return;
    }

    // Convert string role to UserRole enum
    // Handle both 'AppOwner' string values and UserRole.APP_OWNER enum values
    let userRoleEnum: UserRole;
    
    if (typeof user.role === 'string') {
      // Check if the role string is a direct match with enum values
      if (Object.values(UserRole).includes(user.role as UserRole)) {
        userRoleEnum = user.role as UserRole;
      } else {
        // Otherwise, try to match by property name (APP_OWNER vs 'AppOwner')
        const roleKey = Object.keys(UserRole).find(
          key => UserRole[key as keyof typeof UserRole] === user.role
        ) as keyof typeof UserRole | undefined;
        
        if (!roleKey) {
          next(ApiError.forbidden('Invalid user role'));
          return;
        }
        
        userRoleEnum = UserRole[roleKey];
      }
    } else {
      userRoleEnum = user.role;
    }
    
    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(userRoleEnum)) {
      next(ApiError.forbidden('Insufficient permissions'));
      return;
    }

    next();
  };
};