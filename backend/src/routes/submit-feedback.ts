import express, { Request, Response } from 'express';
import PersonalPerformance from '../models/PersonalPerformance';
const router = express.Router();

router.get('/:id', async (_req: Request, res: Response) => {
  try {
    const { id } = _req.params;
    console.log('Searching for feedback with id:', id);

    const feedbackData = await PersonalPerformance.findOne(
      { 'quarterlyTargets.feedbacks._id': id }
    )
    .select({
      'quarterlyTargets': {
        $elemMatch: {
          'feedbacks._id': id
        }
      }
    })
    .populate('quarterlyTargets.feedbacks.feedbackId');

    if (!feedbackData) {
      return res.status(404).json({
        data: null,
        status: 404,
        message: 'Feedback not found'
      });
    }

    return res.json({
      data: {
        feedbackTemplate: feedbackData.quarterlyTargets[0].feedbacks[0].feedbackId,
        feedback: feedbackData.quarterlyTargets[0].feedbacks[0].feedbacks,
        provider: feedbackData.quarterlyTargets[0].feedbacks[0].provider
      },
      status: 200,
      message: 'Feedback retrieved successfully'
    });
  } catch (error) {
    console.error('Error details:', error);
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to retrieve feedback',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/', async (_req: Request, res: Response) => {
  try {
    const { responses, feedbackId } = _req.body;

    // Find the document containing the feedback
    const feedbackData = await PersonalPerformance.findOne(
      { 'quarterlyTargets.feedbacks._id': feedbackId }
    );

    if (!feedbackData) {
      return res.status(404).json({
        data: null,
        status: 404,
        message: 'Feedback not found'
      });
    }

    // Find the correct quarterly target and feedback index
    let targetIndex = -1;
    let feedbackIndex = -1;

    feedbackData.quarterlyTargets.forEach((target, tIndex) => {
      target.feedbacks.forEach((feedback, fIndex) => {
        if (feedback._id.toString() === feedbackId) {
          targetIndex = tIndex;
          feedbackIndex = fIndex;
        }
      });
    });

    if (targetIndex === -1 || feedbackIndex === -1) {
      return res.status(404).json({
        data: null,
        status: 404,
        message: 'Feedback not found in quarterly targets'
      });
    }

    // Update the feedback responses and provider status
    const updatedFeedback = await PersonalPerformance.findOneAndUpdate(
      { 'quarterlyTargets.feedbacks._id': feedbackId },
      { 
        $set: { 
          [`quarterlyTargets.${targetIndex}.feedbacks.${feedbackIndex}.feedbacks`]: responses,
          [`quarterlyTargets.${targetIndex}.feedbacks.${feedbackIndex}.provider.status`]: 'Completed',
        } 
      },
      { new: true }
    );

    if (!updatedFeedback) {
      return res.status(500).json({
        data: null,
        status: 500,
        message: 'Failed to update feedback'
      });
    }

    return res.json({
      data: updatedFeedback,
      status: 200,
      message: 'Feedback updated successfully'  
    });
  } catch (error) {
    console.error('Error details:', error);
    return res.status(500).json({ 
      data: null,
      status: 500,  
      message: 'Failed to update feedback',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 