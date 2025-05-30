import express, { Response } from 'express';
import ComplianceArea from '../models/Compliance';
import { AuthenticatedRequest } from '../types/user';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all compliance areas for the tenant
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const areas = await ComplianceArea.find({ tenantId: req.user?.tenantId });
    return res.json({ data: areas });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching compliance areas' });
  }
});

// Create a new compliance area
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { areaName, description } = req.body;
    const area = new ComplianceArea({ 
      areaName, 
      description,
      tenantId: req.user?.tenantId 
    });
    await area.save();
    return res.status(201).json({ data: area });
  } catch (error) {
    return res.status(400).json({ message: 'Error creating compliance area' });
  }
});

// Update a compliance area
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { areaName, description } = req.body;
    const area = await ComplianceArea.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user?.tenantId },
      { areaName, description },
      { new: true }
    );
    if (!area) {
      return res.status(404).json({ message: 'Compliance area not found' });
    }
    return res.json({ data: area });
  } catch (error) {
    return res.status(400).json({ message: 'Error updating compliance area' });
  }
});

// Delete a compliance area
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const area = await ComplianceArea.findOneAndDelete({ 
      _id: req.params.id, 
      tenantId: req.user?.tenantId 
    });
    if (!area) {
      return res.status(404).json({ message: 'Compliance area not found' });
    }
    return res.json({ message: 'Compliance area deleted successfully' });
  } catch (error) {
    return res.status(400).json({ message: 'Error deleting compliance area' });
  }
});

export default router;
