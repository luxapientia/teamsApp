import express, { Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

router.get('/company-users', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyUsers = await User.find({ tenantId: req.user?.tenantId })
    return res.json(companyUsers.map(user => ({ id: user._id, fullName: user.name, position: 'position', team: 'team', teamId: '' })));
  } catch (error) {
    console.error('Company users error:', error);
    return res.status(500).json({ error: 'Failed to get company users' });
  }
});

export default router; 