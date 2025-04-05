import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import Notification from '../models/Notification';
// import multer from 'multer';
// import fs from 'fs';

const router = express.Router();

router.post('/quarterly-target/submit', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { recipientId, annualTargetId, quarter } = req.body;

    try {
      await Notification.create({
        type: 'quarterlyTarget',
        senderId: 'aaa',
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

router.get('/notifications', authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const notifications = await Notification.find({});
    return res.json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    return res.status(500).json({ error: 'Failed to get notifications' });
  }
});



export default router; 