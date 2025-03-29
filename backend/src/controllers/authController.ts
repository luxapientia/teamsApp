import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const redirectUri = req.query.redirect_uri as string;
      const loginUrl = await this.authService.getLoginUrl(redirectUri);
      res.json({ url: loginUrl });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  };

  callback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.query;
      const result = await this.authService.handleCallback(code as string);
      res.json(result);
    } catch (error) {
      console.error('Callback error:', error);
      res.status(500).json({ error: 'Authentication callback failed' });
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }
      const profile = await this.authService.getProfile(token);
      res.json(profile);
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        await this.authService.logout(token);
      }
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  };
} 