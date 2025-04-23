import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { UserRole } from '../types/user';
import User from '../models/User';
import { ApiError } from '../utils/apiError';
import AnnualTarget from '../models/AnnualTarget';
import { OrgDevPlanService } from '../services/orgDevPlanService';
import { TrainingStatus } from '../types/training';

const router = express.Router();
const orgDevPlanService = new OrgDevPlanService();

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

    return res.json({
      status: 'success',
      data: devMembers
    });
  } catch (error) {
    return next(error);
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

    return res.json({
      status: 'success',
      message: 'Members added to development team successfully'
    });
  } catch (error) {
    return next(error);
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

    return res.json({
      status: 'success',
      message: 'Member removed from development team successfully'
    });
  } catch (error) {
    return next(error);
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

    return res.json({
      status: 'success',
      message: 'Quarterly target updated successfully',
      data: result
    });
  } catch (error) {
    return next(error);
  }
});

// Get all org development plans
router.get('/:tenantId', authenticateToken, async (req, res) => {
  try {
    const { tenantId } = req.params;
    console.log(tenantId, 'tenantId')
    const plans = await orgDevPlanService.getAllPlans(req.params.tenantId);
    console.log(plans, 'plans')
    return res.json({
      status: 'success',
      data: plans
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching plans' });
  }
});

// Create new org development plan
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, tenantId } = req.body;
    if (!name || !tenantId) {
      return res.status(400).json({ message: 'Name and tenantId are required' });
    }
    const plan = await orgDevPlanService.createPlan(name, tenantId);
    return res.status(201).json(plan);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating plan' });
  }
});

// Delete org development plan
router.delete('/:planId', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await orgDevPlanService.deletePlan(planId);
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting plan' });
  }
});

// Get plan details
router.get('/plan/:planId', authenticateToken, async (req, res) => {
  try {
    const plan = await orgDevPlanService.getPlanById(req.params.planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    return res.json(plan);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching plan' });
  }
});

// Get requested trainings
router.get('/trainings/requested', authenticateToken, async (_req, res) => {
  try {
    const trainings = await orgDevPlanService.getRequestedTrainings();
    return res.json(trainings);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching requested trainings' });
  }
});

// Add trainings to plan
router.post('/:planId/trainings', authenticateToken, async (req, res) => {
  try {
    const { trainings } = req.body;
    if (!trainings || !Array.isArray(trainings)) {
      return res.status(400).json({ message: 'Trainings array is required' });
    }
    const updatedPlan = await orgDevPlanService.addTrainingsToPlan(req.params.planId, trainings);
    return res.json(updatedPlan);
  } catch (error) {
    return res.status(500).json({ message: 'Error adding trainings to plan' });
  }
});

// Update training status
router.patch('/:planId/trainings/:trainingId/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!Object.values(TrainingStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const result = await orgDevPlanService.updateTrainingStatus(
      req.params.planId,
      req.params.trainingId,
      status
    );
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating training status' });
  }
});

// Update org development plan
router.put('/:planId', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const updatedPlan = await orgDevPlanService.updatePlan(planId, name);
    if (!updatedPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    return res.json({
      status: 'success',
      message: 'Plan updated successfully',
      data: updatedPlan
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating plan' });
  }
});

// Finalize org development plan
router.post('/:planId/finalize', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;
    const finalizedPlan = await orgDevPlanService.finalizePlan(planId);
    
    if (!finalizedPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    return res.json({
      status: 'success',
      message: 'Plan finalized successfully',
      data: finalizedPlan
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error finalizing plan' });
  }
});

// Unfinalize org development plan
router.post('/:planId/unfinalize', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;
    const unfinalizedPlan = await orgDevPlanService.unfinalizePlan(planId);
    
    if (!unfinalizedPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    return res.json({
      status: 'success',
      message: 'Plan unfinalized successfully',
      data: unfinalizedPlan
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error unfinalizing plan' });
  }
});

export default router; 