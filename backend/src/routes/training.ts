import express, { Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { TrainingService } from '../services/trainingService';

const router = express.Router();
const trainingService = new TrainingService();

// Get all trainings for a plan
router.get('/:planId/employees', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;
    const trainings = await trainingService.getTrainingsByPlanId(planId);
    console.log('trainings', trainings);
    
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
router.post('/:planId/employees', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;
    const { employees } = req.body;

    if (!Array.isArray(employees)) {
      return res.status(400).json({
        status: 'error',
        message: 'Employees must be an array'
      });
    }

    console.log('employees', employees);

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
router.delete('/:planId/employees/:email', authenticateToken, async (req, res) => {
  try {
    const { planId, email } = req.params;
    const removed = await trainingService.removeEmployeeFromPlan(planId, email);
    
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
router.patch('/:planId/employees/:email/status', authenticateToken, async (req, res) => {
  try {
    const { planId, email } = req.params;
    const { trainingRequested, status } = req.body;

    if (!trainingRequested || !status) {
      return res.status(400).json({
        status: 'error',
        message: 'Training requested and status are required'
      });
    }

    const training = await trainingService.updateTrainingStatus(planId, email, trainingRequested, status);
    
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
router.patch('/:planId/employees/:email/request', authenticateToken, async (req, res) => {
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
    const userId = req?.user?._id || '';
    const trainings = await trainingService.getTrainingsByUserId(userId);
    
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
router.get('/user/email/:email', authenticateToken, async (req, res) => {
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

export default router;