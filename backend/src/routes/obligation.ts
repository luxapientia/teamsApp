import express, { Response } from 'express';
import Obligation from '../models/Obligation';
import { AuthenticatedRequest } from '../types/user';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all obligations
router.get('/', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const obligations = await Obligation.find().populate('complianceArea').populate('owner');
    return res.json({ data: obligations });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching obligations' });
  }
});

// Create a new obligation
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { complianceObligation, complianceArea, frequency, lastDueDate, owner, riskLevel, status } = req.body;
    const obligation = new Obligation({ complianceObligation, complianceArea, frequency, lastDueDate, owner, riskLevel, status });
    await obligation.save();
    return res.status(201).json({ data: obligation });
  } catch (error) {
    return res.status(400).json({ message: 'Error creating obligation' });
  }
});

// Update an obligation
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { complianceObligation, complianceArea, frequency, lastDueDate, owner, riskLevel, status } = req.body;
    const obligation = await Obligation.findByIdAndUpdate(
      req.params.id,
      { complianceObligation, complianceArea, frequency, lastDueDate, owner, riskLevel, status },
      { new: true }
    );
    if (!obligation) {
      return res.status(404).json({ message: 'Obligation not found' });
    }
    return res.json({ data: obligation });
  } catch (error) {
    return res.status(400).json({ message: 'Error updating obligation' });
  }
});

// Delete an obligation
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const obligation = await Obligation.findByIdAndDelete(req.params.id);
    if (!obligation) {
      return res.status(404).json({ message: 'Obligation not found' });
    }
    return res.json({ message: 'Obligation deleted successfully' });
  } catch (error) {
    return res.status(400).json({ message: 'Error deleting obligation' });
  }
});

export default router; 