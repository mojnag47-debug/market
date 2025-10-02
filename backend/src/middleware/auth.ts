import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../shared/database';
import {
  AuthenticatedRequest,
  JWTPayload,
  UnauthorizedError,
  ForbiddenError,
  UserRole,
} from '../shared/types';

// JWT utility functions
export const generateTokens = (payload: Omit<JWTPayload, 'iat' | 'exp'>): {
  accessToken: string;
  refreshToken: string;
} => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  const accessToken = jwt.sign(payload, process.env.JWT_PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'nextgen-auth',
    audience: 'user-access'
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: 'nextgen-auth',
    audience: 'token-refresh'
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string): JWTPayload => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  try {
    return jwt.verify(token, process.env.JWT_PUBLIC_KEY, {
    algorithms: ['RS256'],
    ignoreExpiration: false,
    issuer: 'nextgen-auth',
    audience: ['user-access', 'token-refresh']
  }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    } else {
      throw new UnauthorizedError('Authentication failed');
    }
  }
};

// Authentication middleware
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Add user to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication middleware (doesn't throw if no token)
export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (user) {
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
      };
    }

    next();
  } catch (error) {
    // Continue without authentication on error
    next();
  }
};

// Role-based authorization middleware
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};

// Admin only middleware
export const adminOnly = authorize([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

// Seller or admin middleware
export const sellerOrAdmin = authorize([UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN]);

// Customer or above middleware
export const customerOrAbove = authorize([
  UserRole.CUSTOMER,
  UserRole.SELLER,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
]);

// Owner or admin middleware (for resource ownership checks)
export const ownerOrAdmin = (getResourceUserId: (req: AuthenticatedRequest) => string | Promise<string>) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // Admin can access everything
      if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user.role)) {
        return next();
      }

      const resourceUserId = await getResourceUserId(req);
      
      if (req.user.userId !== resourceUserId) {
        throw new ForbiddenError('Access denied - not the owner of this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Rate limiting by user
export const userRateLimit = new Map<string, { count: number; resetTime: number }>();

export const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(); // Skip rate limiting for unauthenticated requests
    }

    const userId = req.user.userId;
    const now = Date.now();
    const userLimit = userRateLimit.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      // Reset or initialize
      userRateLimit.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        timestamp: new Date().toISOString(),
      });
    }

    userLimit.count++;
    next();
  };
};

export default {
  generateTokens,
  verifyToken,
  authenticate,
  optionalAuthenticate,
  authorize,
  adminOnly,
  sellerOrAdmin,
  customerOrAbove,
  ownerOrAdmin,
  rateLimitByUser,
};