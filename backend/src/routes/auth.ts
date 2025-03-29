import express, { Request, Response } from 'express';
import { authService } from '../services/authService';

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

    const { code } = req.body;
    
    if (!code) {
      console.error('No code provided in callback request');
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    console.log('Processing callback with code:', code);
    const result = await authService.handleCallback(code);
    console.log('Callback processed successfully:', result);
    
    return res.json(result);
  } catch (error: any) {
    console.error('Callback error details:', {
      error: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    return res.status(500).json({ error: 'Authentication failed', details: error.message });
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

export default router; 