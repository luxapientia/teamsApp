import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { dUser } from '../types/user';
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

  
  const user = await authService.verifyToken(token);
  if (!user) {
    console.log('Token verification failed');
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
  const duser = {
    MicrosoftId: user.MicrosoftId, // Microsoft ID
    name: user.name,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    jobTitle: user.jobTitle,
    teamId: user.teamId,
    isDevMember: user.isDevMember
  }
  req.user = duser;
  next();
}; 