import { UserProfile } from '../services/authService';

declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
    }
  }
} 