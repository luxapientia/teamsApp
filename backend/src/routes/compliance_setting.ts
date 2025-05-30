import express, { Response } from 'express';
import ComplianceSetting from '../models/ComplianceSetting';
import { AuthenticatedRequest } from '../types/user';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all compliance settings for the tenant
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await ComplianceSetting.find({ tenantId: req.user?.tenantId });
    return res.json({ data: settings });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching compliance settings' });
  }
});

// Create a new compliance setting
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { year, firstMonth, quarters } = req.body;
    const setting = new ComplianceSetting({ 
      year, 
      firstMonth, 
      quarters,
      tenantId: req.user?.tenantId 
    });
    await setting.save();
    return res.status(201).json({ data: setting });
  } catch (error) {
    return res.status(400).json({ message: 'Error creating compliance setting' });
  }
});

// Update a compliance setting
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { year, firstMonth, quarters } = req.body;
    const setting = await ComplianceSetting.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user?.tenantId },
      { year, firstMonth, quarters },
      { new: true }
    );
    if (!setting) {
      return res.status(404).json({ message: 'Compliance setting not found' });
    }
    return res.json({ data: setting });
  } catch (error) {
    return res.status(400).json({ message: 'Error updating compliance setting' });
  }
});

// Delete a compliance setting
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const setting = await ComplianceSetting.findOneAndDelete({ 
      _id: req.params.id, 
      tenantId: req.user?.tenantId 
    });
    if (!setting) {
      return res.status(404).json({ message: 'Compliance setting not found' });
    }
    return res.json({ message: 'Compliance setting deleted successfully' });
  } catch (error) {
    return res.status(400).json({ message: 'Error deleting compliance setting' });
  }
});

export default router; 