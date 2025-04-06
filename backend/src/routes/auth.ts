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
    const { code, token, redirect_uri } = req.body;
    
    // Handle Teams SSO token
    if (token) {
      console.log('Processing Teams SSO token...');
      const userProfile = await authService.verifyTeamsToken(token);
      
      if (!userProfile) {
        console.error('Teams token verification failed');
        return res.status(401).json({ error: 'Invalid Teams token' });
      } else {
        const user = await roleService.getUser(userProfile.id);
        const role = await roleService.getRoleByEmail(userProfile.email);
        userProfile.role = role || UserRole.USER;
        if (!user) {
          await roleService.createUser(userProfile.id, userProfile.email, userProfile.displayName, role || UserRole.USER, userProfile.tenantId);
        } else {
          await roleService.updateUser(
            userProfile.id,
            {
              MicrosoftId: userProfile.id,
              name: userProfile.displayName,
              email: userProfile.email,
              role: role || UserRole.USER,
              tenantId: userProfile.tenantId
            }
          );
        }
      }

      const appToken = await authService.createAppToken(userProfile);
      console.log('App token created successfully');
      
      const response = { 
        token: appToken, 
        user: userProfile 
      };
      
      return res.json(response);
    }
    
    // Handle standard login code
    if (code) {
      console.log('Processing standard login code...');
      const result = await authService.handleCallback(code, redirect_uri);

      return res.json(result);
    }

    console.error('No token or code provided in request');
    return res.status(400).json({ error: 'Either code or token is required' });
  } catch (error: any) {
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