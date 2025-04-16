import express, { Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import User from '../models/User';
import Team from '../models/Team';
import PersonalPerformance from '../models/PersonalPerformance';
import { UserRole } from '../types/user';
const router = express.Router();

router.get('/company-users', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyUsers = await User.find({ tenantId: req.user?.tenantId }).populate('teamId') as any[];
    return res.json(companyUsers.map(user => ({ id: user._id, fullName: user.name, jobTitle: user.jobTitle, team: user.teamId?.name, teamId: user.teamId?._id })));
  } catch (error) {
    console.error('Company users error:', error);
    return res.status(500).json({ error: 'Failed to get company users' });
  }
});

router.get('/team-performances', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { annualTargetId } = req.query;
    const user = req.user;
    const allPersonalPerformances = await PersonalPerformance.find({ annualTargetId, tenantId: req.user?.tenantId }).populate('userId').populate('teamId') as any[];
    let isTeamOwner = true;
    let teamId = '';

    const team = await Team.findOne({ owner: user?.MicrosoftId });
    if (team) {
      isTeamOwner = true;
      teamId = team._id as string;
    } else {
      isTeamOwner = false;
    }


    const teamPerformances: any[] = [];
    allPersonalPerformances.forEach(performance => {
      if (user?.role === UserRole.SUPER_USER || user?.role === UserRole.APP_OWNER) {
        teamPerformances.push({ ...performance._doc, fullName: performance.userId.name, jobTitle: performance.userId.jobTitle, team: performance.teamId?.name });
      } else {
        if (performance.quarterlyTargets[0].supervisorId === req.user?._id) {
          teamPerformances.push({ ...performance._doc, fullName: performance.userId.name, jobTitle: performance.userId.jobTitle, team: performance.teamId?.name });
        } else {
          if (isTeamOwner && performance.teamId?._id.toString() === teamId) {
            teamPerformances.push({ ...performance._doc, fullName: performance.userId.name, jobTitle: performance.userId.jobTitle, team: performance.teamId?.name });
          }
        }
      }
    }
  );

    return res.json(teamPerformances);
  } catch (error) {
    console.error('Team performances error:', error);
    return res.status(500).json({ error: 'Failed to get team performances' });
  }
});

export default router; 