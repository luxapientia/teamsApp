import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/teamscorecards',
  azure: {
    tenantId: process.env.AZURE_TENANT_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/auth/callback',
    allowedGroupIds: (process.env.ALLOWED_GROUP_IDS || '').split(',').filter(Boolean)
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  }
}; 