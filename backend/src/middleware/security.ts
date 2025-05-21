import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { Express } from 'express';
import xss from 'xss-clean';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';

// Rate limiting configuration
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// More strict rate limiting for auth routes
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Please try again after 10 minutes',
      retryAfter: 600 // 10 minutes in seconds
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers middleware
export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Strict transport security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // Content security policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  next();
};

// Apply all security middleware
export const applySecurityMiddleware = (app: Express) => {
  // Basic security headers
  app.use(helmet());
  
  // Prevent XSS attacks
  app.use(xss());
  
  // Prevent HTTP Parameter Pollution
  app.use(hpp());
  
  // Sanitize MongoDB queries
  app.use(mongoSanitize());
  
  // Apply rate limiting to all routes
  app.use('/api/', apiLimiter);
  
  // Apply stricter rate limiting to auth routes
  app.use('/api/auth', authLimiter);
  
  // Apply custom security headers
  app.use(securityHeaders);
  
  // Trust proxy if behind a reverse proxy
  app.set('trust proxy', 1);
};