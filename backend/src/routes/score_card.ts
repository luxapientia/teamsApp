import express, { Request, Response } from 'express';
import { AnnualTarget } from '../models/AnnualTarget';

const router = express.Router();

router.get('/annual-targets', async (_req: Request, res: Response) => {
  try {
    const annualTargets = await AnnualTarget.find() as AnnualTarget[];
    return res.json(annualTargets);
  } catch (error) {
    console.error('Annual targets error:', error);
    return res.status(500).json({ error: 'Failed to get annual targets' });
  }
});

router.post('/create-annual-target', async (req: Request, res: Response) => {
  try {
    const annualTarget = await AnnualTarget.create(req.body);
    return res.json(annualTarget);
  } catch (error) {
    console.error('Create annual target error:', error);
    return res.status(500).json({ error: 'Failed to create annual target' });
  }
});

export default router; 