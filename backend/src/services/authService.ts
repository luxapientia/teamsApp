import axios from 'axios';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import * as dotenv from 'dotenv';
import { superUserService } from './superUserService';

dotenv.config();

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  tenantId: string;
  organizationName?: string;
}

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

  async handleCallback(code: string, redirect_uri?: string): Promise<{ token: string; user: UserProfile }> {
    try {
      console.log('Starting callback handling with code:', code.substring(0, 10) + '...');
      console.log('Using redirect URI:', redirect_uri || config.azure.redirectUri);
      
      // Get token from Azure AD
      const tokenEndpoint = `https://login.microsoftonline.com/${config.azure.tenantId}/oauth2/v2.0/token`;
      const tokenParams = new URLSearchParams({
        client_id: config.azure.clientId!,
        client_secret: config.azure.clientSecret!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri || config.azure.redirectUri,
        scope: 'openid profile email User.Read Organization.Read.All'
      });

      console.log('Requesting token from Azure AD...');
      const tokenResponse = await axios.post(tokenEndpoint, tokenParams.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('Token received from Azure AD');
      const { access_token } = tokenResponse.data;

      // Get user profile from Microsoft Graph API
      console.log('Fetching user profile from Microsoft Graph...');
      const profileResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });

      // Get organization info
      console.log('Fetching organization info...');
      const orgResponse = await axios.get('https://graph.microsoft.com/v1.0/organization', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });

      const tenantId = orgResponse.data.value[0].id;
      console.log('Organization info received, tenant ID:', tenantId);

      // Check if organization is allowed
      const isAllowed = await this.isOrganizationAllowed(tenantId);
      if (!isAllowed) {
        console.error('Organization not authorized:', tenantId);
        throw new Error('Your organization is not authorized to use this application');
      }

      // Determine user role
      console.log('Determining user role...');
      const superUsers = await superUserService.getAll();
      let isSuperUser = superUsers.some(su => su.email === profileResponse.data.userPrincipalName);

      const userProfile: UserProfile = {
        id: profileResponse.data.id,
        email: profileResponse.data.userPrincipalName,
        firstName: profileResponse.data.givenName,
        lastName: profileResponse.data.surname,
        role: (process.env.APP_OWNER_EMAIL === profileResponse.data.userPrincipalName) ? 'Owner' : 
              (isSuperUser ? 'SuperUser' : 'User'),
        status: 'active',
        tenantId: tenantId,
        organizationName: orgResponse.data.value[0].displayName
      };

      console.log('User profile created:', {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role
      });

      // Create JWT token
      const token = jwt.sign(userProfile, config.jwtSecret, { 
        expiresIn: '1h',
        audience: config.azure.clientId,
        issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`
      });

      console.log('JWT token created');
      return { token, user: userProfile };
    } catch (error: any) {
      console.error('Authentication error:', {
        message: error.message,
        response: error.response?.data,
        config: error.config,
        stack: error.stack
      });
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  private async isOrganizationAllowed(tenantId: string): Promise<boolean> {
    // If no allowed tenants are configured, allow all
    if (!process.env.ALLOWED_TENANT_IDS) {
      console.log('No tenant restrictions configured, allowing all organizations');
      return true;
    }

    const allowedTenants = process.env.ALLOWED_TENANT_IDS.split(',').map(id => id.trim());
    console.log('Checking if tenant is allowed:', tenantId);
    console.log('Allowed tenants:', allowedTenants);
    
    return allowedTenants.includes(tenantId);
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
}

export const authService = new AuthService(); 