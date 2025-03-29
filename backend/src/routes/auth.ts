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
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const result = await authService.handleCallback(code);
    return res.json(result);
  } catch (error) {
    console.error('Callback error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
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