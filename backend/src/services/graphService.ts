import axios from 'axios';
import * as msal from '@azure/msal-node';
import { ApiError } from '../utils/apiError';

interface GraphResponse {
  value: any[];
  '@odata.nextLink'?: string;
}

export class GraphService {
  private async getAppAccessToken(tenantId: string): Promise<string> {
    try {
      const config = new msal.ConfidentialClientApplication({
        auth: {
          clientId: process.env.AZURE_CLIENT_ID!,
          clientSecret: process.env.AZURE_CLIENT_SECRET!,
          authority: `https://login.microsoftonline.com/${tenantId}`
        }
      });

      const result = await config.acquireTokenByClientCredential({
        scopes: ['https://graph.microsoft.com/.default']
      });

      if (!result?.accessToken) {
        throw new Error('Failed to acquire access token');
      }

      return result.accessToken;
    } catch (error: any) {
      console.error('Error getting app access token:', error);
      
      // Check for consent errors
      if (error.errorCode === 'invalid_grant' || 
          (error.response?.data?.error === 'invalid_grant' && 
           error.response?.data?.error_description?.includes('consent'))) {
        throw new ApiError('Application requires admin consent. Please contact your administrator.', 403);
      }
      
      throw error;
    }
  }

  async getOrganizationUsers(tenantId: string, pageSize: number = 20, nextLink?: string): Promise<GraphResponse> {
    try {
      if (!tenantId) {
        throw new ApiError('Tenant ID is required', 400);
      }

      console.log('Getting access token for tenant:', tenantId);
      const accessToken = await this.getAppAccessToken(tenantId);
      console.log('Successfully got access token');
      
      console.log('Fetching users from Graph API');
      try {
        const url = nextLink || `https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail,jobTitle,department&$top=${pageSize}&$orderby=displayName`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            ConsistencyLevel: 'eventual'
          }
        });
        console.log('Successfully fetched users from Graph API');

        return {
          value: response.data.value,
          '@odata.nextLink': response.data['@odata.nextLink']
        };
      } catch (error: any) {
        if (error.response?.status === 403) {
          // Check if it's a terms of use issue
          if (error.response?.data?.error?.message?.includes('terms of use')) {
            throw new ApiError(
              'Terms of Use acceptance required. Please contact your administrator to set up Terms of Use in Azure AD.',
              403
            );
          }
          throw new ApiError(
            'Insufficient permissions to access user data. Please ensure the application has User.Read.All and Directory.Read.All permissions.',
            403
          );
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Error fetching organization users:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch organization users', 500);
    }
  }

  getConsentUrl(tenantId: string): string {
    // Include state parameter to handle the redirect back to the app
    const state = Buffer.from(JSON.stringify({
      tenantId,
      returnUrl: process.env.APP_URL || 'http://localhost:3000'
    })).toString('base64');

    const baseUrl = `https://login.microsoftonline.com/${tenantId}/adminconsent`;
    const params = new URLSearchParams({
      client_id: process.env.AZURE_CLIENT_ID!,
      redirect_uri: process.env.REDIRECT_URI || 'http://localhost:3001/api/auth/consent-callback',
      state,
      scope: 'https://graph.microsoft.com/.default'
    });
    return `${baseUrl}?${params.toString()}`;
  }

  async sendMail(tenantId: string, fromUserId: string, toEmail: string, subject: string, body: string): Promise<void> {
    try {
      if (!tenantId) {
        throw new ApiError('Tenant ID is required', 400);
      }

      if (!fromUserId) {
        throw new ApiError('Sender user ID is required', 400);
      }

      console.log('Getting access token for tenant:', tenantId);
      const accessToken = await this.getAppAccessToken(tenantId);
      console.log('Successfully got access token');

      const message = {
        message: {
          subject,
          body: {
            contentType: 'HTML',
            content: body
          },
          toRecipients: [
            {
              emailAddress: {
                address: toEmail
              }
            }
          ]
        },
        saveToSentItems: true
      };

      try {
        await axios.post(
          `https://graph.microsoft.com/v1.0/users/${fromUserId}/sendMail`,
          message,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Email sent successfully');
      } catch (error: any) {
        console.error('Graph API error:', error.response?.data);
        if (error.response?.status === 403) {
          throw new ApiError(
            'Insufficient permissions to send email. Please ensure the application has Mail.Send permissions.',
            403
          );
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to send email', 500);
    }
  }
}

export const graphService = new GraphService(); 