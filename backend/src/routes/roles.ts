import express from 'express';
import { roleService } from '../services/roleService';
import { authenticateToken } from '../middleware/auth';
import { requireRole, requireSameCompanyOrHigherRole } from '../middleware/roleAuth';
import type { AuthenticatedRequest } from '../middleware/roleAuth';
import { UserRole } from '../types/role';
import { ApiError } from '../utils/apiError';

const router = express.Router();

// Get user's role
router.get(
  '/user/:userId',
  authenticateToken,
  requireRole([UserRole.APP_OWNER, UserRole.SUPER_USER]),
  requireSameCompanyOrHigherRole,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const role = await roleService.getUserRole(req.params.userId);
      res.json({
        status: 'success',
        data: { role }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Create initial role assignment
router.post(
  '/create',
  authenticateToken,
  requireRole([UserRole.APP_OWNER, UserRole.SUPER_USER]),
  requireSameCompanyOrHigherRole,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { userId, email, role, companyId } = req.body;

      // Validate required fields
      if (!userId || !email || !role) {
        throw new ApiError('Missing required fields', 400);
      }

      // Validate role value
      if (!Object.values(UserRole).includes(role)) {
        throw new ApiError('Invalid role value', 400);
      }

      const assigner = req.user;
      if (!assigner) {
        throw new ApiError('User not authenticated', 401);
      }

      // Validate role assignment permissions
      const canAssign = await roleService.validateRoleAssignment(
        assigner.role as UserRole,
        role as UserRole
      );

      if (!canAssign) {
        throw new ApiError('Insufficient permissions to assign this role', 403);
      }

      const result = await roleService.createUserRole(
        userId,
        email,
        role as UserRole,
        companyId
      );

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update user status
router.patch(
  '/status/:userId',
  authenticateToken,
  requireRole([UserRole.APP_OWNER, UserRole.SUPER_USER]),
  requireSameCompanyOrHigherRole,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { status } = req.body;
      const { userId } = req.params;

      // Validate userId
      if (!userId) {
        throw new ApiError('User ID is required', 400);
      }

      // Validate status
      if (!status || !['active', 'inactive'].includes(status)) {
        throw new ApiError('Invalid status value', 400);
      }

      const result = await roleService.updateUserStatus(
        userId,
        status as 'active' | 'inactive'
      );

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all users with specific role
router.get(
  '/users/:role',
  authenticateToken,
  requireRole([UserRole.APP_OWNER]),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const roleParam = req.params.role;

      // Validate role parameter
      if (!roleParam || !Object.values(UserRole).includes(roleParam as UserRole)) {
        throw new ApiError('Invalid role', 400);
      }

      const users = await roleService.getAllUsersWithRole(roleParam as UserRole);
      res.json({
        status: 'success',
        data: users
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router; 