import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided in request');
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  console.log('Token received:', token.substring(0, 10) + '...');
  
  const user = authService.verifyToken(token);
  if (!user) {
    console.log('Token verification failed');
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  console.log('Token verified successfully for user:', user);
  req.user = user;
  next();
}; 