import express, { Request, Response } from 'express';
import { companyService } from '../services/companyService';
import { ApiResponse } from '../types';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all companies
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const companies = await companyService.getAll();
    return res.json({ 
      data: companies,
      status: 200,
      message: 'Companies retrieved successfully'
    } as ApiResponse<typeof companies>);
  } catch (error) {
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to fetch companies'
    } as ApiResponse<null>);
  }
});

// Create company
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const companyData = {
      ...req.body,
      createdOn: new Date().toISOString()
    };

    const company = await companyService.create(companyData);
    return res.status(201).json({ 
      data: company,
      status: 201,
      message: 'Company created successfully'
    } as ApiResponse<typeof company>);
  } catch (error: any) {
    console.error('Error creating company:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        data: null,
        status: 400,
        message: 'Company name already exists'
      } as ApiResponse<null>);
    }

    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to create company'
    } as ApiResponse<null>);
  }
});

// Update company
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await companyService.update(id, req.body);
    
    if (!company) {
      return res.status(404).json({ 
        data: null,
        status: 404,
        message: 'Company not found'
      } as ApiResponse<null>);
    }

    return res.json({ 
      data: company,
      status: 200,
      message: 'Company updated successfully'
    } as ApiResponse<typeof company>);
  } catch (error: any) {
    console.error('Error updating company:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        data: null,
        status: 400,
        message: 'Company name already exists'
      } as ApiResponse<null>);
    }

    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to update company'
    } as ApiResponse<null>);
  }
});

// Delete company
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await companyService.getById(id);
    
    if (!company) {
      return res.status(404).json({ 
        data: null,
        status: 404,
        message: 'Company not found'
      } as ApiResponse<null>);
    }

    await companyService.delete(id);
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting company:', error);
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to delete company'
    } as ApiResponse<null>);
  }
});

export default router; 