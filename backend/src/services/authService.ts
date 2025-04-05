import axios from 'axios';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import * as dotenv from 'dotenv';
import { UserProfile } from '../types';

dotenv.config();

export class AuthService {
  async getLoginUrl(state?: string): Promise<string> {
    const authUrl = `https://login.microsoftonline.com/${config.azure.tenantId}/oauth2/v2.0/authorize`;
    const params = new URLSearchParams({
      client_id: config.azure.clientId!,
      response_type: 'code',
      redirect_uri: config.azure.redirectUri,
      scope: 'openid profile email User.Read Organization.Read.All',
      response_mode: 'query',
      prompt: 'consent',
      ...(state && { state })
    });

    return `${authUrl}?${params.toString()}`;
  }

  async handleCallback(code: string, redirectUri: string): Promise<{ token: string; user: UserProfile }> {
    try {
      const tokenResponse = await axios.post(
        `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
        {
          client_id: process.env.AZURE_CLIENT_ID,
          scope: 'openid profile email',
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          client_secret: process.env.AZURE_CLIENT_SECRET
        }
      );

      const accessToken = tokenResponse.data.access_token;
      const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const userData = userResponse.data;
      const userProfile: UserProfile = {
        id: userData.id,
        email: userData.mail || userData.userPrincipalName,
        displayName: userData.displayName,
        jobTitle: userData.jobTitle || '',
        department: userData.department || '',
        organization: userData.companyName || '',
        roles: ['user'],
        status: 'active',
        tenantId: userData.tenantId,
        organizationName: userData.companyName || ''
      };

      const token = await this.createAppToken(userProfile);
      return { token, user: userProfile };
    } catch (error) {
      console.error('Error in handleCallback:', error);
      throw error;
    }
  }

  verifyToken(token: string): UserProfile | null {
    try {
      return jwt.verify(token, config.jwtSecret) as UserProfile;
    } catch (error) {
      return null;
    }
  }

  async getProfile(token: string): Promise<UserProfile> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as UserProfile;
      return decoded;
    } catch (error) {
      console.error('Profile error:', error);
      throw new Error('Invalid token');
    }
  }

  async logout(token: string): Promise<void> {
    try {
      jwt.verify(token, config.jwtSecret);
      // You could implement token blacklisting here if needed
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async verifyTeamsToken(token: string): Promise<UserProfile | null> {
    try {
      const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const userData = response.data;
      return {
        id: userData.id,
        email: userData.mail || userData.userPrincipalName,
        displayName: userData.displayName,
        jobTitle: userData.jobTitle || '',
        department: userData.department || '',
        organization: userData.companyName || '',
        roles: ['user'],
        status: 'active',
        tenantId: userData.tenantId,
        organizationName: userData.companyName || ''
      };
    } catch (error) {
      console.error('Error verifying Teams token:', error);
      return null;
    }
  }

  async createAppToken(userProfile: UserProfile): Promise<string> {
    return jwt.sign(
      { 
        id: userProfile.id,
        email: userProfile.email,
        roles: userProfile.roles
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
  }
}

export const authService = new AuthService(); 