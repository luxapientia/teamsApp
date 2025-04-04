import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { Team } from '../models/Team';

const router = express.Router();

router.get('/:tenantId', authenticateToken, async (req: Request, res: Response) => {
  console.log('Teams request:', req.params);
  try {
    const { tenantId } = req.params;

    if (!tenantId) {
      return res.status(400).json({ error: 'Missing tenantId parameter' });
    }

    const teams = await Team.find({ tenantId });

    if (!teams.length) {
      return res.status(404).json({ message: 'No teams found for this tenantId' });
    }

    return res.json(teams);
  } catch (error) {
    console.error('Teams error:', error);
    return res.status(500).json({ error: 'Failed to get teams' });
  }

});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { tenantId, name } = req.body;

    if (!tenantId || !name) {
      return res.status(400).json({ error: 'Missing tenantId or name parameter' });
    }

    const team = new Team({ tenantId, name, members: [] });
    await team.save();

    return res.json(team);
  } catch (error) {
    console.error('Teams error:', error);
    return res.status(500).json({ error: 'Failed to create team' });
  }
});

router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: 'Missing id or name parameter' });
    }

    const team = await Team.findByIdAndUpdate(id, { name }, { new: true });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    return res.json(team);
  } catch (error) {
    console.error('Teams error:', error);
    return res.status(500).json({ error: 'Failed to update team' });
  }
});

router.post('/:teamId/members', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Prevent duplicate members
    if (team.members.includes(userId)) {
      return res.status(400).json({ error: 'User is already a member of this team' });
    }

    team.members.push(userId);
    await team.save();

    return res.json({ message: 'Member added successfully', team });
  } catch (error) {
    console.error('Add member error:', error);
    return res.status(500).json({ error: 'Failed to add member to team' });
  }
});

router.delete('/:teamId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({ error: 'Missing teamId parameter' });
    }

    const team = await Team.findByIdAndDelete(teamId);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    return res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Teams error:', error);
    return res.status(500).json({ error: 'Failed to delete team' });
  }
});

export default router;