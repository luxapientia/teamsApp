import express, { Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import Notification from '../models/Notification';
import { AuthenticatedRequest } from '../middleware/auth';
import { socketService } from '../server';
import { SocketEvent } from '../types/socket';
import User from '../models/User';
// import multer from 'multer';
// import fs from 'fs';

const router = express.Router();

router.post('/agreement/submit', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recipientId, annualTargetId, quarter } = req.body;

    try {
      const existingNotification = await Notification.findOne({
        senderId: req.user?._id,
        recipientId,
        annualTargetId,
        quarter,
        type: 'agreement'
      });

      const recipientUser = await User.findById(recipientId);

      if (!recipientUser) {
        return res.status(404).json({ error: 'Recipient user not found' });
      }

      socketService.emitToUser(recipientUser.MicrosoftId, SocketEvent.NOTIFICATION, {
        type: 'agreement',
        senderId: req.user?._id,
        recipientId,
        annualTargetId,
        quarter,
        isRead: false
      });


      if (existingNotification) {
        await Notification.updateOne(
          { _id: existingNotification._id },
          { $set: { isRead: false } }
        );
        return res.status(200).json({ message: 'Notification already exists' });
      }

      await Notification.create({
        type: 'agreement',
        senderId: req.user?._id,
        recipientId,
        annualTargetId,
        quarter,
        isRead: false
      });

    } catch (error) {
      console.error('Error creating notification:', error);
      return res.status(500).json({ error: 'Failed to create notification' });
    }

    return res.status(200).json({ message: 'Notification created successfully' });
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ error: 'Failed to create notification' });
  }
});

router.post('/assessment/submit', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recipientId, annualTargetId, quarter } = req.body;

    try {
      const recipientUser = await User.findById(recipientId);

      if (!recipientUser) {
        return res.status(404).json({ error: 'Recipient user not found' });
      }

      socketService.emitToUser(recipientUser.MicrosoftId, SocketEvent.NOTIFICATION, {
        type: 'agreement',
        senderId: req.user?._id,
        recipientId,
        annualTargetId,
        quarter,
        isRead: false
      });
      
      const existingNotification = await Notification.findOne({
        senderId: req.user?._id,
        recipientId,
        annualTargetId,
        quarter,
        type: 'assessment'
      });

      if (existingNotification) {
        await Notification.updateOne(
          { _id: existingNotification._id },
          { $set: { isRead: false } }
        );
        return res.status(200).json({ message: 'Notification already exists' });
      }

      await Notification.create({
        type: 'assessment',
        senderId: req.user?._id,
        recipientId,
        annualTargetId,
        quarter,
        isRead: false
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      return res.status(500).json({ error: 'Failed to create notification' });
    }

    return res.status(200).json({ message: 'Notification created successfully' });
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ error: 'Failed to create notification' });
  }
});

router.get('/notifications', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user?._id
    }).populate('senderId') as any;

    const result = notifications.map((notification: any) => {
      return {
        _id: notification._id,
        type: notification.type,
        sender: {
          _id: notification.senderId._id,
          fullName: notification.senderId.name,
          team: "Team 1"
        },
        annualTargetId: notification.annualTargetId,
        quarter: notification.quarter,
        isRead: notification.isRead,
        updatedAt: notification.updatedAt
      };
    });

    return res.json(result);
  } catch (error) {
    console.error('Error getting notifications:', error);
    return res.status(500).json({ error: 'Failed to get notifications' });
  }
});



export default router; 