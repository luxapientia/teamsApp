import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { UserProfile } from '../services/authService';

interface AuthenticatedRequest extends Request {
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
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const user = authService.verifyToken(token);
  if (!user) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  console.log(user, 'user')
  req.user = user;
  next();
}; 