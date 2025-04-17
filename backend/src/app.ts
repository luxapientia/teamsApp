import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config';
import authRoutes from './routes/auth';
import companyRoutes from './routes/companies';
import superUserRoutes from './routes/superUsers';
import licenseRoutes from './routes/licenses';
import { errorHandler } from './middleware/errorHandler';
import scoreCardRoutes from './routes/score_card';
import personalPerformanceRoutes from './routes/personal_performance';
import notificationRoutes from './routes/notifications';
import teamRoutes from './routes/teams';
import reportRoutes from './routes/report';
import { authenticateToken } from './middleware/auth';
import { checkLicenseStatus } from './middleware/licenseCheck';
import userRoutes from './routes/User';
import orgDevTeamRoutes from './routes/orgDevTeam';
const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://app.teamscorecards.online'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Public routes (no license check)
app.use('/api/auth', authRoutes);

// Protected routes with license check
// Apply both authentication and license check middleware
app.use('/api/companies', authenticateToken, checkLicenseStatus, companyRoutes);
app.use('/api/super-users', authenticateToken, checkLicenseStatus, superUserRoutes);
app.use('/api/licenses', authenticateToken, checkLicenseStatus, licenseRoutes);
app.use('/api/score-card', authenticateToken, checkLicenseStatus, scoreCardRoutes);
app.use('/api/personal-performance', authenticateToken, checkLicenseStatus, personalPerformanceRoutes);
app.use('/api/notifications', authenticateToken, checkLicenseStatus, notificationRoutes);
app.use('/api/teams', authenticateToken, checkLicenseStatus, teamRoutes);
app.use('/api/report', authenticateToken, checkLicenseStatus, reportRoutes);
app.use('/api/users', authenticateToken, checkLicenseStatus, userRoutes);
app.use('/api/users/org-dev-team', orgDevTeamRoutes);


// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Error handling middleware
app.use(errorHandler);

export default app; 