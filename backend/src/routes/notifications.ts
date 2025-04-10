import express, { Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import Notification from '../models/Notification';
import { AuthenticatedRequest } from '../middleware/auth';
import { socketService } from '../server';
import { SocketEvent } from '../types/socket';
import User from '../models/User';
import PersonalPerformance from '../models/PersonalPerformance';
import { graphService } from '../services/graphService';
// import multer from 'multer';
// import fs from 'fs';

const router = express.Router();

router.post('/agreement/submit', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recipientId, annualTargetId, quarter, personalPerformanceId } = req.body;
    const recipientUser = await User.findById(recipientId);

    if (!recipientUser) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }

    const existingNotification = await Notification.findOne({
      senderId: req.user?._id,
      recipientId,
      annualTargetId,
      quarter,
      type: 'agreement',
      personalPerformanceId
    });



    if (existingNotification) {
      await Notification.updateOne(
        { _id: existingNotification._id },
        { $set: { isRead: false } }
      );
    } else {
      await Notification.create({
        type: 'agreement',
        senderId: req.user?._id,
        recipientId,
        annualTargetId,
        quarter,
        isRead: false,
        personalPerformanceId
      });
    }
    socketService.emitToUser(recipientUser.MicrosoftId, SocketEvent.NOTIFICATION, {});

    return res.status(200).json({ message: 'Notification created successfully' });
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ error: 'Failed to create notification' });
  }
});

router.post('/agreement/recall', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recipientId, annualTargetId, quarter, personalPerformanceId } = req.body;

    const recipientUser = await User.findById(recipientId);

    if (!recipientUser) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }

    const existingNotification = await Notification.findOne({
      senderId: req.user?._id,
      recipientId,
      annualTargetId,
      quarter,
      type: 'agreement',
      personalPerformanceId
    });

    if (existingNotification) {
      await Notification.deleteOne({ _id: existingNotification._id });
    }
    socketService.emitToUser(recipientUser.MicrosoftId, SocketEvent.NOTIFICATION, {});

    return res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ error: 'Failed to delete notification' });
  }
});

router.post('/assessment/submit', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recipientId, annualTargetId, quarter, personalPerformanceId } = req.body;

    const recipientUser = await User.findById(recipientId);

    if (!recipientUser) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }

    const existingNotification = await Notification.findOne({
      senderId: req.user?._id,
      recipientId,
      annualTargetId,
      quarter,
      type: 'assessment',
      personalPerformanceId
    });

    if (existingNotification) {
      await Notification.updateOne(
        { _id: existingNotification._id },
        { $set: { isRead: false } }
      );
    } else {
      await Notification.create({
        type: 'assessment',
        senderId: req.user?._id,
        recipientId,
        annualTargetId,
        quarter,
        isRead: false,
        personalPerformanceId
      });
    }

    socketService.emitToUser(recipientUser.MicrosoftId, SocketEvent.NOTIFICATION, {});
    return res.status(200).json({ message: 'Notification created successfully' });
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ error: 'Failed to create notification' });
  }
});

router.post('/assessment/recall', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recipientId, annualTargetId, quarter, personalPerformanceId } = req.body;

    const recipientUser = await User.findById(recipientId);

    if (!recipientUser) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }

    const existingNotification = await Notification.findOne({
      senderId: req.user?._id,
      recipientId,
      annualTargetId,
      quarter,
      type: 'assessment',
      personalPerformanceId
    });

    if (existingNotification) {
      await Notification.deleteOne({ _id: existingNotification._id });
    }
    socketService.emitToUser(recipientUser.MicrosoftId, SocketEvent.NOTIFICATION, {});

    return res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ error: 'Failed to delete notification' });
  }
});

router.get('/notifications', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user?._id
    }).populate('senderId').populate('personalPerformanceId') as any;

    const result = notifications.map((notification: any) => {
      return {
        _id: notification._id,
        type: notification.type,
        sender: {
          _id: notification.senderId._id,
          fullName: notification.senderId.name,
          teamId: notification.personalPerformanceId.teamId
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

router.get('/personal-performance/:notificationId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const personalPerformance = await PersonalPerformance.findOne({
      annualTargetId: notification.annualTargetId,
      userId: notification.senderId
    });

    return res.json(personalPerformance);
  } catch (error) {
    console.error('Error getting personal performance:', error);
    return res.status(500).json({ error: 'Failed to get personal performance' });
  }
});

router.post('/read/:notificationId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await Notification.updateOne({ _id: notificationId }, { $set: { isRead: true } });

    socketService.emitToUser(req.user?.MicrosoftId as string, SocketEvent.NOTIFICATION, {
      type: notification.type,
      senderId: notification.senderId,
      recipientId: notification.recipientId,
      annualTargetId: notification.annualTargetId,
      quarter: notification.quarter,
      isRead: true
    });
    return res.status(200).json({ message: 'Notification read successfully' });
  } catch (error) {
    console.error('Error reading notification:', error);
    return res.status(500).json({ error: 'Failed to read notification' });
  }
});

router.post('/approve/:notificationId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const personalPerformance = await PersonalPerformance.findOne({ _id: notification.personalPerformanceId });
    if (personalPerformance) {
      const quarterlyTargets = personalPerformance.quarterlyTargets;
      const newQuarterlyTargets = quarterlyTargets.map((quarterlyTarget: any) => {
        if (quarterlyTarget.quarter === notification.quarter) {
          if (notification.type === 'agreement') {
            return {
              ...quarterlyTarget._doc,
              agreementStatus: 'Approved'
            };
          } else {
            return {
              ...quarterlyTarget._doc,
              assessmentStatus: 'Approved'
            };
          }
        }
        return quarterlyTarget;
      });
      await PersonalPerformance.updateOne({ _id: notification.personalPerformanceId }, { $set: { quarterlyTargets: newQuarterlyTargets } });
    }

    await Notification.deleteOne({ _id: notificationId });

    return res.status(200).json({ message: 'Notification send back successfully' });
  } catch (error) {
    console.error('Error send back notification:', error);
    return res.status(500).json({ error: 'Failed to send back notification' });
  }
});

router.post('/send-back/:notificationId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    const { emailBody, emailSubject, senderId } = req.body;
    const sender = await User.findById(senderId);
    
    if (!sender?.email) {
      return res.status(404).json({ error: 'Sender email not found' });
    }

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const personalPerformance = await PersonalPerformance.findOne({ _id: notification.personalPerformanceId });
    if (personalPerformance) {
      const quarterlyTargets = personalPerformance.quarterlyTargets;
      const newQuarterlyTargets = quarterlyTargets.map((quarterlyTarget: any) => {
        if (quarterlyTarget.quarter === notification.quarter) {
          if (notification.type === 'agreement') {
            return {
              ...quarterlyTarget._doc,
              agreementStatus: 'Send Back'
            };
          } else {
            return {
              ...quarterlyTarget._doc,
              assessmentStatus: 'Send Back'
            };
          }
        }
        return quarterlyTarget;
      });
      await PersonalPerformance.updateOne(
        { _id: notification.personalPerformanceId },
        { $set: { quarterlyTargets: newQuarterlyTargets } }
      );

      // Send email notification using the provided subject
      const emailContent = `
        <html>
          <body>
            <h2>Performance ${notification.type === 'agreement' ? 'Agreement' : 'Assessment'} Update</h2>
            <p>Your ${notification.type === 'agreement' ? 'performance agreement' : 'performance assessment'} for ${notification.quarter} has been sent back for revision.</p>
            <p>Here goes the reason for sending back the ${notification.type === 'agreement' ? 'performance agreement' : 'performance assessment'}:</p>
            <p>${emailBody}</p>
            <p>Please log in to the system to review and make the necessary changes.</p>
          </body>
        </html>
      `;

      // Use the current user's ID (req.user.MicrosoftId) to send the email
      await graphService.sendMail(
        req.user?.tenantId || '',
        req.user?.MicrosoftId || '',
        sender.email,
        emailSubject,
        emailContent
      );
    }

    await Notification.deleteOne({ _id: notificationId });

    return res.status(200).json({ message: 'Notification sent back successfully and email notification sent' });
  } catch (error) {
    console.error('Error sending back notification:', error);
    return res.status(500).json({ error: 'Failed to send back notification' });
  }
});


export default router; 