import axios from 'axios';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  tenantId: string;
}

export class AuthService {
  async getLoginUrl(): Promise<string> {
    const authUrl = `https://login.microsoftonline.com/${config.azure.tenantId}/oauth2/v2.0/authorize`;
    const params = new URLSearchParams({
      client_id: config.azure.clientId!,
      response_type: 'code',
      redirect_uri: config.azure.redirectUri,
      scope: 'openid profile email User.Read Organization.Read.All',
      response_mode: 'query'
    });

    return `${authUrl}?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<{ token: string }> {
    try {
      const tokenResponse = await axios.post(
        `https://login.microsoftonline.com/${config.azure.tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: config.azure.clientId!,
          client_secret: config.azure.clientSecret!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: config.azure.redirectUri,
          scope: 'openid profile email User.Read Organization.Read.All'
        })
      );

      const { access_token } = tokenResponse.data;

      // Get user profile from Microsoft Graph API
      const profileResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });

      // Get organization info
      const orgResponse = await axios.get('https://graph.microsoft.com/v1.0/organization', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });

      const userProfile: UserProfile = {
        id: profileResponse.data.id,
        email: profileResponse.data.userPrincipalName,
        firstName: profileResponse.data.givenName,
        lastName: profileResponse.data.surname,
        role: 'user',
        status: 'active',
        tenantId: orgResponse.data.value[0].id
      };

      // Create JWT token
      const token = jwt.sign(userProfile, config.jwtSecret, { 
        expiresIn: '1h',
        audience: config.azure.clientId,
        issuer: `https://login.microsoftonline.com/${config.azure.tenantId}/v2.0`
      });

      return { token };
    } catch (error: any) {
      console.error('Authentication error:', error.response?.data || error.message);
      throw new Error('Authentication failed');
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
      // Verify token is valid
      jwt.verify(token, config.jwtSecret);
      // You could implement token blacklisting here if needed
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  verifyToken(token: string): UserProfile | null {
    try {
      return jwt.verify(token, config.jwtSecret) as UserProfile;
    } catch (error) {
      return null;
    }
  }
}

// Create and export an instance of AuthService
export const authService = new AuthService(); 