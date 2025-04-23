import express, { Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../middleware/auth';
import Feedback from '../models/Feedback';

const router = express.Router();

// Get all companies
router.get('/', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = _req.user?.tenantId;
    const feedback = await Feedback.find({ tenantId });
    return res.json({ 
      data: feedback,
      status: 200,
      message: 'Feedback retrieved successfully'
    });
  } catch (error) {
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to fetch feedback'
    });
  }
});

router.post('/create-feedback', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = _req.user?.tenantId;
    const feedback = await Feedback.create({ ..._req.body, tenantId });
    return res.json({ data: feedback, status: 200, message: 'Feedback created successfully' });
  } catch (error) {
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to create feedback'
    });
  }
});

router.put('/update-feedback/:id', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = _req.params;
    const feedback = await Feedback.findByIdAndUpdate(id, _req.body, { new: true });
    return res.json({ data: feedback, status: 200, message: 'Feedback updated successfully' });
  } catch (error) {
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to update feedback'
    });
  }
});

export default router; 