import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { UserRole } from '../types/user';
import User from '../models/User';
import { ApiError } from '../utils/apiError';

const router = express.Router();

// Get all development team members for a tenant
router.get('/getAll/:tenantId', authenticateToken, async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    console.log('tenantId', tenantId);
    
    if (!tenantId) {
      throw new ApiError('Tenant ID is required', 400);
    }

    const devMembers = await User.find({
      tenantId,
      isDevMember: true 
    }).select('MicrosoftId name email jobTitle');

    res.json({
      status: 'success',
      data: devMembers
    });
  } catch (error) {
    next(error);
  }
});

// Add members to development team
router.post('/add', authenticateToken, requireRole([UserRole.SUPER_USER, UserRole.APP_OWNER]), async (req, res, next) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new ApiError('User IDs array is required', 400);
    }

    await User.updateMany(
      { MicrosoftId: { $in: userIds } },
      { $set: { isDevMember: true } }
    );

    res.json({
      status: 'success',
      message: 'Members added to development team successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Remove member from development team
router.delete('/remove/:userId', authenticateToken, requireRole([UserRole.SUPER_USER, UserRole.APP_OWNER]), async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      throw new ApiError('User ID is required', 400);
    }

    await User.findOneAndUpdate(
      { MicrosoftId: userId },
      { $set: { isDevMember: false } }
    );

    res.json({
      status: 'success',
      message: 'Member removed from development team successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router; 