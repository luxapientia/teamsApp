import express, { Request, Response } from 'express';
import { authService } from '../services/authService';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

router.get('/login', async (_req: Request, res: Response) => {
  try {
    const loginUrl = await authService.getLoginUrl();
    return res.json({ url: loginUrl });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to generate login URL' });
  }
});

router.post('/callback', async (req: Request, res: Response) => {
  try {
    console.log('Received callback request:', {
      body: req.body,
      headers: req.headers
    });

    const { code, redirect_uri } = req.body;
    
    if (!code) {
      console.error('No code provided in callback request');
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    console.log('Processing callback with code:', code.substring(0, 10) + '...');
    console.log('Redirect URI:', redirect_uri);

    const result = await authService.handleCallback(code, redirect_uri);
    console.log('Callback processed successfully');
    
    return res.json(result);
  } catch (error: any) {
    console.error('Callback error details:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    return res.status(500).json({ 
      error: 'Authentication failed', 
      details: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

router.get('/profile', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const profile = await authService.getProfile(token);
    return res.json(profile);
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    await authService.logout(token);
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    return res.json(req.user);
  } catch (error) {
    console.error('Error in /me endpoint:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 