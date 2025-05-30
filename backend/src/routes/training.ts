import express, { Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { TrainingService } from '../services/trainingService';
import User from '../models/User';

const router = express.Router();
const trainingService = new TrainingService();

// Get all employees across all plans
router.get('/all-employees', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({
        status: 'error',
        message: 'Tenant ID is required'
      });
    }

    const allEmployees = await trainingService.getAllEmployeesAcrossPlans(tenantId);
    
    return res.json({
      status: 'success',
      data: {
        employees: allEmployees
      }
    });
  } catch (error) {
    console.error('Error fetching all employees:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch all employees'
    });
  }
});

// Get all trainings for a plan
router.get('/:planId/employees', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planId } = req.params;
    const trainings = await trainingService.getTrainingsByPlanId(planId);

    return res.json({
      status: 'success',
      data: {
        employees: trainings
      }
    });
  } catch (error) {
    console.error('Error fetching trainings:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch trainings'
    });
  }
});

// Add employees to a plan
router.post('/:planId/employees', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planId } = req.params;
    const { employees } = req.body;

    if (!Array.isArray(employees)) {
      return res.status(400).json({
        status: 'error',
        message: 'Employees must be an array'
      });
    }

    const trainings = await trainingService.addEmployeesToPlan(planId, employees);
    
    return res.json({
      status: 'success',
      message: 'Employees added successfully',
      data: {
        employees: trainings
      }
    });
  } catch (error) {
    console.error('Error adding employees:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to add employees'
    });
  }
});

// Remove an employee from a plan
router.delete('/:planId/employees/:email', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planId, email } = req.params;
    const { trainingRequested, annualTargetId, quarter } = req.body;

    if (!trainingRequested || !annualTargetId || !quarter) {
      return res.status(400).json({
        status: 'error',
        message: 'Training requested, annual target ID, and quarter are required'
      });
    }

    const removed = await trainingService.removeEmployeeFromPlan(
      planId, 
      email, 
      trainingRequested,
      annualTargetId,
      quarter
    );
    
    if (!removed) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found in plan'
      });
    }

    return res.json({
      status: 'success',
      message: 'Employee removed successfully'
    });
  } catch (error) {
    console.error('Error removing employee:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to remove employee'
    });
  }
});

// Update training status
router.patch('/:planId/employees/:email/status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planId, email } = req.params;
    const { trainingRequested, annualTargetId, quarter, status } = req.body;

    if (!trainingRequested || !status || !annualTargetId || !quarter) {
      return res.status(400).json({
        status: 'error',
        message: 'Training requested, status, annual target ID, and quarter are required'
      });
    }

    const training = await trainingService.updateTrainingStatus(
      planId, 
      email, 
      trainingRequested,
      annualTargetId,
      quarter,
      status
    );
    
    if (!training) {
      return res.status(404).json({
        status: 'error',
        message: 'Training not found'
      });
    }

    return res.json({
      status: 'success',
      message: 'Training status updated successfully',
      data: {
        training
      }
    });
  } catch (error) {
    console.error('Error updating training status:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update training status'
    });
  }
});

// Update training request
router.patch('/:planId/employees/:email/request', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planId, email } = req.params;
    const { trainingRequested } = req.body;

    if (!trainingRequested) {
      return res.status(400).json({
        status: 'error',
        message: 'Training request is required'
      });
    }

    const training = await trainingService.updateTrainingRequest(planId, email, trainingRequested);
    
    if (!training) {
      return res.status(404).json({
        status: 'error',
        message: 'Training not found'
      });
    }

    return res.json({
      status: 'success',
      message: 'Training request updated successfully',
      data: {
        training
      }
    });
  } catch (error) {
    console.error('Error updating training request:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update training request'
    });
  }
});

// Get trainings by Microsoft ID
router.get('/user/:userId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const MicrosoftId = req?.user?.id || '';
    const userId = await User.findOne({ MicrosoftId });
    if (!userId) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    const trainings = await trainingService.getTrainingsByUserId(userId._id);
    
    return res.json({
      status: 'success',
      data: {
        trainings
      }
    });
  } catch (error) {
    console.error('Error fetching trainings:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch trainings'
    });
  }
});

// Get trainings by email
router.get('/user/email/:email', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email } = req.params;
    const trainings = await trainingService.getTrainingsByEmail(email); 

    return res.json({
      status: 'success',
      data: {
        trainings
      }
    });
  } catch (error) {
    console.error('Error fetching trainings:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch trainings'
    });
  }
});

// Get trainings by annual target
router.get('/annual-target/:annualTargetId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { annualTargetId } = req.params;
    const trainings = await trainingService.getTrainingsByAnnualTarget(annualTargetId);

    return res.json({
      status: 'success',
      data: {
        trainings
      }
    });
  } catch (error) {
    console.error('Error fetching trainings:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch trainings'
    });
  }
});

// Get trainings by annual target and quarter
router.get('/annual-target/:annualTargetId/quarter/:quarter', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { annualTargetId, quarter } = req.params;
    const trainings = await trainingService.getTrainingsByQuarter(annualTargetId, quarter);

    return res.json({
      status: 'success',
      data: {
        trainings
      }
    });
  } catch (error) {
    console.error('Error fetching trainings:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch trainings'
    });
  }
});

export default router;