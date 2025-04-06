import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import User from '../models/User';
import { dUser } from '../types/role';
export interface AuthenticatedRequest extends Request {
  user?: dUser;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided in request');
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  
  const user = authService.verifyToken(token);
  if (!user) {
    console.log('Token verification failed');
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  const result = await User.findOne({ email: user.email }) as dUser;

  req.user = result;
  next();
}; 