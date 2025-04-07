import express, { Request, Response } from 'express';
import { superUserService } from '../services/superUserService';
import { ApiResponse } from '../types';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all super users
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const superUsers = await superUserService.getAll();
    return res.json({ 
      data: superUsers,
      status: 200,
      message: 'Super users retrieved successfully'
    } as ApiResponse<typeof superUsers>);
  } catch (error) {
    console.error('Error fetching super users:', error);
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to fetch super users'
    } as ApiResponse<null>);
  }
});

// Create super user
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const superUser = await superUserService.create(req.body);
    return res.status(201).json({ 
      data: superUser,
      status: 201,
      message: 'Super user created successfully'
    } as ApiResponse<typeof superUser>);
  } catch (error: any) {
    console.error('Error creating super user. Request body:', req.body);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({ 
        data: null,
        status: 400,
        message: 'Email already exists'
      } as ApiResponse<null>);
    }

    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to create super user'
    } as ApiResponse<null>);
  }
});

// Update super user
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const superUser = await superUserService.update(id, req.body);
    
    if (!superUser) {
      return res.status(404).json({ 
        data: null,
        status: 404,
        message: 'Super user not found'
      } as ApiResponse<null>);
    }

    return res.json({ 
      data: superUser,
      status: 200,
      message: 'Super user updated successfully'
    } as ApiResponse<typeof superUser>);
  } catch (error: any) {
    console.error('Error updating super user:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({ 
        data: null,
        status: 400,
        message: 'Email already exists'
      } as ApiResponse<null>);
    }

    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to update super user'
    } as ApiResponse<null>);
  }
});

// Delete super user
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await superUserService.delete(id);
    return res.json({ 
      data: null,
      status: 200,
      message: 'Super user deleted successfully'
    } as ApiResponse<null>);
  } catch (error) {
    console.error('Error deleting super user:', error);
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to delete super user'
    } as ApiResponse<null>);
  }
});

// Get super user by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const superUser = await superUserService.getById(id);
    
    if (!superUser) {
      return res.status(404).json({ 
        data: null,
        status: 404,
        message: 'Super user not found'
      } as ApiResponse<null>);
    }

    return res.json({ 
      data: superUser,
      status: 200,
      message: 'Super user retrieved successfully'
    } as ApiResponse<typeof superUser>);
  } catch (error) {
    console.error('Error fetching super user:', error);
    return res.status(500).json({ 
      data: null,
      status: 500,
      message: 'Failed to fetch super user'
    } as ApiResponse<null>);
  }
});

export default router; 