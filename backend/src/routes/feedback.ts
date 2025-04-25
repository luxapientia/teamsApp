import express, { Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../middleware/auth';
import Feedback, { FeedbackDocument } from '../models/Feedback';
import { omit } from 'lodash';
const router = express.Router();

// Get all companies
router.get('/', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = _req.user?.tenantId;
    const feedback = await Feedback.find({ tenantId }) as FeedbackDocument[];
    return res.json({ 
      data: feedback,
      status: 200,
      message: 'Feedback retrieved successfully'
    });
  } catch (error) {
    return res.status(500).json({ 
      data: [],
      status: 500,
      message: 'Failed to fetch feedback'
    });
  }
});

router.post('/create-feedback', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = _req.user?.tenantId;
    const newFeedback = { ..._req.body, tenantId };
    const feedback = await Feedback.create(omit(newFeedback, '_id')) as FeedbackDocument;
    return res.json({ data: feedback, status: 200, message: 'Feedback created successfully' });
  } catch (error) {
    console.log('error', error);
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to create feedback'
    });
  }
});

router.put('/update-feedback', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const newFeedback = { ..._req.body, tenantId: _req.user?.tenantId };
    const feedback = await Feedback.findByIdAndUpdate(newFeedback._id, newFeedback, { new: true });
    console.log('feedback', feedback);
    return res.json({ data: feedback, status: 200, message: 'Feedback updated successfully' });
  } catch (error) {
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to update feedback'
    });
  }
});

router.delete('/delete-feedback/:id', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    console.log(_req.params, 'params');
    const { id } = _req.params;
    await Feedback.findByIdAndDelete(id);
    return res.json({ status: 200, message: 'Feedback deleted successfully' });
  } catch (error) {
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to delete feedback'
    });
  }
});
export default router; 