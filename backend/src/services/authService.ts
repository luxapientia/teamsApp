import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import { config } from '../config';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

class AuthService {
  async login(_req: Request, res: Response): Promise<void> {
    const authUrl = `https://login.microsoftonline.com/${config.azure.tenantId}/oauth2/v2.0/authorize`;
    const params = new URLSearchParams({
      client_id: config.azure.clientId!,
      response_type: 'code',
      redirect_uri: config.azure.redirectUri,
      scope: 'openid profile email',
      state: 'random-state-value'
    });

    res.redirect(`${authUrl}?${params.toString()}`);
  }

  async callback(req: Request, res: Response): Promise<void> {
    const { code } = req.query;

    if (!code) {
      res.status(400).json({ error: 'Authorization code is required' });
      return;
    }

    try {
      const tokenResponse = await axios.post(
        `https://login.microsoftonline.com/${config.azure.tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: config.azure.clientId!,
          client_secret: config.azure.clientSecret!,
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: config.azure.redirectUri
        })
      );

      const { access_token } = tokenResponse.data;

      // Get user profile from Microsoft Graph API
      const profileResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });

      const userProfile: UserProfile = {
        id: profileResponse.data.id,
        email: profileResponse.data.userPrincipalName,
        firstName: profileResponse.data.givenName,
        lastName: profileResponse.data.surname,
        role: 'user', // You can set this based on your requirements
        status: 'active'
      };

      // Create JWT token
      const token = jwt.sign(userProfile, config.jwtSecret, { expiresIn: '1h' });

      // Redirect to frontend with token
      res.redirect(`${config.frontend.url}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const decoded = jwt.verify(token, config.jwtSecret) as UserProfile;
      res.json(decoded);
    } catch (error) {
      console.error('Profile error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    // Clear any server-side session if needed
    res.json({ message: 'Logged out successfully' });
  }

  verifyToken(token: string): UserProfile | null {
    try {
      return jwt.verify(token, config.jwtSecret) as UserProfile;
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService(); 