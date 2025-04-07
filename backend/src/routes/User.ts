import express from 'express';
import { roleService } from '../services/roleService';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import type { AuthenticatedRequest } from '../middleware/roleAuth';
import { UserRole } from '../types/user';
import { ApiError } from '../utils/apiError';

const router = express.Router();

// Get user's role
router.get(
  '/user/:microsoftId',
  authenticateToken,
  requireRole([UserRole.APP_OWNER, UserRole.SUPER_USER]),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const role = await roleService.getUser(req.params.microsoftId);
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
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { MicrosoftId, email, name, role, tenantId } = req.body;

      // Validate required fields
      if (!MicrosoftId || !email || !role) {
        throw new ApiError('Missing required fields', 400);
      }

      // Validate role value
      if (!Object.values(UserRole).includes(role)) {
        throw new ApiError('Invalid role value', 400);
      }

      const user = req.user;
      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const result = await roleService.createUser(
        MicrosoftId,
        name,
        email,
        role as UserRole,
        tenantId
      );

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update user
router.put(
  '/status/:userId',
  authenticateToken,
  requireRole([UserRole.APP_OWNER, UserRole.SUPER_USER]),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { userId } = req.params;
      const { microsoftId, name, email, role, tenantId } = req.body;

      // Validate userId
      if (!userId) {
        throw new ApiError('User ID is required', 400);
      }
      const result = await roleService.updateUser(microsoftId, { MicrosoftId: microsoftId, name, email, role, tenantId });
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

// Get all users with specific tenantId
router.get(
  '/users/tenant/:tenantId',
  authenticateToken,
  requireRole([UserRole.APP_OWNER]),  
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { tenantId } = req.params;
      const users = await roleService.getAllUsersWithTenantID(tenantId);
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