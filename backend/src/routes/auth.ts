import express, { Request, Response } from 'express';
import { authService } from '../services/authService';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../middleware/auth';
import { roleService } from '../services/roleService';
import { UserRole } from '../types/role';

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

    const { code, token, redirect_uri } = req.body;
    
    // Handle Teams SSO token
    if (token) {
      console.log('Processing Teams SSO token...');
      const userProfile = await authService.verifyTeamsToken(token);
      console.log('Teams token verification result:', userProfile);
      
      if (!userProfile) {
        console.error('Teams token verification failed');
        return res.status(401).json({ error: 'Invalid Teams token' });
      } else {
        console.log(userProfile, 'userProfile');
        const user = await roleService.getUser(userProfile.id);
        if (!user) {
          await roleService.createUser(userProfile.id, userProfile.email, userProfile.displayName, UserRole.USER, userProfile.tenantId);
        }
      }

      const appToken = await authService.createAppToken(userProfile);
      console.log('App token created successfully');
      
      const response = { 
        token: appToken, 
        user: userProfile 
      };
      
      console.log('Sending response:', {
        hasToken: !!response.token,
        hasUser: !!response.user,
        userEmail: response.user.email
      });
      
      return res.json(response);
    }
    
    // Handle standard login code
    if (code) {
      console.log('Processing standard login code...');
      const result = await authService.handleCallback(code, redirect_uri);
      if (result.user) {
        const user = await roleService.getUser(result.user.id);
        if (!user) {
          await roleService.createUser(
            result.user.id,
            result.user.email,
            result.user.displayName,
            UserRole.USER,
            result.user.tenantId
          );
        }
      }
      return res.json(result);
    }

    console.error('No token or code provided in request');
    return res.status(400).json({ error: 'Either code or token is required' });
  } catch (error: any) {
    console.error('Callback error details:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
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