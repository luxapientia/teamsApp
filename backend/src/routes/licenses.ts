import express, { Request, Response } from 'express';
import { licenseService } from '../services/licenseService';
import { ApiResponse } from '../types';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all licenses
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const licenses = await licenseService.getAll();
    return res.json({ 
      data: licenses,
      status: 200,
      message: 'Licenses retrieved successfully'
    } as ApiResponse<typeof licenses>);
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to fetch licenses'
    } as ApiResponse<null>);
  }
});

// Create new license
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { companyId } = req.body;
    const license = await licenseService.createBlankLicense(companyId);
    return res.json({ 
      data: license,
      status: 201,
      message: 'License created successfully'
    } as ApiResponse<typeof license>);
  } catch (error) {
    console.error('Error creating license:', error);
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to create license'
    } as ApiResponse<null>);
  }
});

// Update license by company ID
router.post('/:companyId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const license = await licenseService.updateByCompanyId(companyId, req.body);
    
    if (!license) {
      return res.status(404).json({ 
        data: null,
        status: 404,
        message: 'License not found'
      } as ApiResponse<null>);
    }

    return res.json({ 
      data: license,
      status: 200,
      message: 'License updated successfully'
    } as ApiResponse<typeof license>);
  } catch (error) {
    console.error('Error updating license:', error);
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to update license'
    } as ApiResponse<null>);
  }
});

// Get license by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const license = await licenseService.getById(id);
    
    if (!license) {
      return res.status(404).json({ 
        data: null,
        status: 404,
        message: 'License not found'
      } as ApiResponse<null>);
    }

    return res.json({ 
      data: license,
      status: 200,
      message: 'License retrieved successfully'
    } as ApiResponse<typeof license>);
  } catch (error) {
    console.error('Error fetching license:', error);
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to fetch license'
    } as ApiResponse<null>);
  }
});

// Update license by ID
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const license = await licenseService.update(id, req.body);
    
    if (!license) {
      return res.status(404).json({ 
        data: null,
        status: 404,
        message: 'License not found'
      } as ApiResponse<null>);
    }

    return res.json({ 
      data: license,
      status: 200,
      message: 'License updated successfully'
    } as ApiResponse<typeof license>);
  } catch (error) {
    console.error('Error updating license:', error);
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to update license'
    } as ApiResponse<null>);
  }
});

// Delete license (reset to blank state)
router.delete('/:companyId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    if (!companyId || companyId === 'null') {
      return res.json({ 
        data: null,
        status: 200,
        message: 'No license to reset'
      } as ApiResponse<null>);
    }
    
    // Instead of deleting, reset the license to blank state
    const license = await licenseService.updateByCompanyId(companyId, {
      licenseKey: '',
      startDate: '',
      endDate: '',
      status: 'inactive'
    });

    return res.json({ 
      data: license,
      status: 200,
      message: 'License reset successfully'
    } as ApiResponse<typeof license>);
  } catch (error) {
    console.error('Error resetting license:', error);
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to reset license'
    } as ApiResponse<null>);
  }
});

export default router; 