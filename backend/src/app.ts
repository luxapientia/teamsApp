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
import orgDevPlanRoutes from './routes/orgDevPlan';
import trainingCoursesRoutes from './routes/trainingCourses';
import trainingRoutes from './routes/training';
import feedbackRoutes from './routes/feedback';
import moduleRoutes from './routes/module';
import submitFeedbackRoutes from './routes/submit-feedback';
import { checkFeedbackMail } from './services/feedbackService';
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
app.use('/api/users/org-dev-plan', orgDevPlanRoutes);
app.use('/api/training-courses', trainingCoursesRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/feedback', authenticateToken, checkLicenseStatus, feedbackRoutes);
app.use('/api/module', authenticateToken, checkLicenseStatus, moduleRoutes);
app.use('/api/submit-feedback', submitFeedbackRoutes);

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    setInterval(checkFeedbackMail, 1000 * 60 * 60 * 1);
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Error handling middleware
app.use(errorHandler);

export default app; 
