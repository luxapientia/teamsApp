import express, { Request, Response } from 'express';
import AnnualTarget, { AnnualTargetDocument } from '../models/AnnualTarget';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/annual-targets', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const annualTargets = await AnnualTarget.find() as AnnualTargetDocument[];
    return res.json(annualTargets);
  } catch (error) {
    console.error('Annual targets error:', error);
    return res.status(500).json({ error: 'Failed to get annual targets' });
  }
});

router.post('/create-annual-target', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { annualTarget } = req.body;
    const existingAnnualTarget = await AnnualTarget.findOne({ name: annualTarget.name });
    if (existingAnnualTarget) {
      return res.status(400).json({ error: 'Annual target already exists' });
    }

    const newAnnualTarget = await AnnualTarget.create(annualTarget) as AnnualTargetDocument;
    return res.json(newAnnualTarget);
  } catch (error) {
    console.error('Create annual target error:', error);
    return res.status(500).json({ error: 'Failed to create annual target' });
  }
});

router.put('/update-annual-target/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { annualTarget } = req.body;

    const updatedAnnualTarget = await AnnualTarget.findByIdAndUpdate(id, annualTarget, { new: true });
    return res.json(updatedAnnualTarget);
  } catch (error) {
    console.error('Update annual target error:', error);
    return res.status(500).json({ error: 'Failed to update annual target' });
  }
});

router.delete('/delete-annual-target/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await AnnualTarget.findByIdAndDelete(id);
    return res.json({ message: 'Annual target deleted successfully' });
  } catch (error) {
    console.error('Delete annual target error:', error);
    return res.status(500).json({ error: 'Failed to delete annual target' });
  }
});

export default router; 