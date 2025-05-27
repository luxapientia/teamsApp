import express, { Response } from 'express';
import ComplianceArea from '../models/Compliance';
import { AuthenticatedRequest } from '../types/user';
import { authenticateToken } from '../middleware/auth';


const router = express.Router();

// Get all compliance areas
router.get('/', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const areas = await ComplianceArea.find();
    return res.json(areas);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching compliance areas' });
  }
});

// Create a new compliance area
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { areaName, description } = req.body;
    const area = new ComplianceArea({ areaName, description });
    await area.save();
    return res.status(201).json(area);
  } catch (error) {
    return res.status(400).json({ message: 'Error creating compliance area' });
  }
});

// Update a compliance area
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { areaName, description } = req.body;
    const area = await ComplianceArea.findByIdAndUpdate(
      req.params.id,
      { areaName, description },
      { new: true }
    );
    if (!area) {
      return res.status(404).json({ message: 'Compliance area not found' });
    }
    return res.json(area);
  } catch (error) {
    return res.status(400).json({ message: 'Error updating compliance area' });
  }
});

// Delete a compliance area
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const area = await ComplianceArea.findByIdAndDelete(req.params.id);
    if (!area) {
      return res.status(404).json({ message: 'Compliance area not found' });
    }
    return res.json({ message: 'Compliance area deleted successfully' });
  } catch (error) {
    return res.status(400).json({ message: 'Error deleting compliance area' });
  }
});

export default router;
