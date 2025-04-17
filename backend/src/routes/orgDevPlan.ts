import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { UserRole } from '../types/user';
import User from '../models/User';
import { ApiError } from '../utils/apiError';
import AnnualTarget from '../models/AnnualTarget';

const router = express.Router();

// Get all development team members for a tenant
router.get('/get-all-members/:tenantId', authenticateToken, async (req, res, next) => {
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
router.post('/add-member', authenticateToken, requireRole([UserRole.SUPER_USER, UserRole.APP_OWNER]), async (req, res, next) => {
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
router.delete('/remove-member/:userId', authenticateToken, requireRole([UserRole.SUPER_USER, UserRole.APP_OWNER]), async (req, res, next) => {
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

// Update quarterly target enable status
router.post('/update-quarterly-target', authenticateToken, async (req, res, next) => {
  try {
    const { annualTargetId, quarter, isEnabled } = req.body;
    console.log(annualTargetId, quarter, isEnabled, 'backend')
    if (!annualTargetId || !quarter || typeof isEnabled !== 'boolean') {
      throw new ApiError('Invalid request parameters', 400);
    }

    const result = await AnnualTarget.findOneAndUpdate(
      {
        _id: annualTargetId,
        'content.quarterlyTarget.quarterlyTargets.quarter': quarter
      },
      {
        $set: {
          'content.quarterlyTarget.quarterlyTargets.$.isDevelopmentPlanEnabled': isEnabled
        }
      },
      { new: true }
    );
    if (!result) {
      throw new ApiError('Quarterly target not found', 404);
    }

    res.json({
      status: 'success',
      message: 'Quarterly target updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

export default router; 