import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';
import hpp from 'hpp';
import { body, validationResult } from 'express-validator';
import { z } from 'zod';

// =============================================================================
// RATE LIMITING CONFIGURATIONS
// =============================================================================

/**
 * General API rate limiting
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

/**
 * Strict rate limiting for auth endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Authentication rate limit exceeded',
      message: 'Too many authentication attempts from this IP, please try again later.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

/**
 * Ultra-strict rate limiting for password reset
 */
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 password reset requests per hour
  message: {
    error: 'Too many password reset attempts, please try again later.',
    code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Password reset rate limit exceeded',
      message: 'Too many password reset attempts from this IP, please try again later.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

/**
 * API key based rate limiting (for different user tiers)
 */
export const createApiKeyRateLimit = (maxRequests: number, windowMs: number = 15 * 60 * 1000) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user?.id || req.ip;
    },
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'API rate limit exceeded',
        message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000 / 60} minutes.`,
        retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      });
    },
  });
};

// =============================================================================
// HELMET SECURITY CONFIGURATION
// =============================================================================

/**
 * Comprehensive Helmet configuration for security headers
 */
export const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: [
        "'self'",
        "'nonce-{{NONCE}}'",
        'https://static.cloudflareinsights.com'
      ],
      styleSrc: ["'self'", "'nonce-{{NONCE}}'"],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: { 
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true 
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' }
});\n\n// =============================================================================\n// HTTPS ENFORCEMENT\n// =============================================================================\n\n/**\n * HTTPS enforcement middleware\n */\nexport const enforceHTTPS = (req: Request, res: Response, next: NextFunction) => {\n  // Skip in development\n  if (process.env.NODE_ENV === 'development') {\n    return next();\n  }\n\n  // Check if request is secure\n  const isSecure = req.secure || \n                  req.get('x-forwarded-proto') === 'https' ||\n                  req.get('x-forwarded-ssl') === 'on';\n\n  if (!isSecure) {\n    return res.status(426).json({\n      success: false,\n      error: 'HTTPS Required',\n      message: 'This API requires HTTPS. Please use https:// instead of http://',\n    });\n  }\n\n  next();\n};\n\n// =============================================================================\n// INPUT SANITIZATION\n// =============================================================================\n\n/**\n * Sanitize user input to prevent XSS attacks\n */\nexport const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {\n  // Sanitize request body\n  if (req.body) {\n    req.body = sanitizeObject(req.body);\n  }\n\n  // Sanitize query parameters\n  if (req.query) {\n    req.query = sanitizeObject(req.query);\n  }\n\n  // Sanitize URL parameters\n  if (req.params) {\n    req.params = sanitizeObject(req.params);\n  }\n\n  next();\n};\n\n/**\n * Recursively sanitize an object\n */\nfunction sanitizeObject(obj: any): any {\n  if (typeof obj === 'string') {\n    return xss(obj, {\n      whiteList: {}, // No HTML tags allowed\n      stripIgnoreTag: true,\n      stripIgnoreTagBody: ['script'],\n    });\n  }\n\n  if (Array.isArray(obj)) {\n    return obj.map(sanitizeObject);\n  }\n\n  if (obj && typeof obj === 'object') {\n    const sanitized: any = {};\n    for (const key in obj) {\n      if (obj.hasOwnProperty(key)) {\n        sanitized[key] = sanitizeObject(obj[key]);\n      }\n    }\n    return sanitized;\n  }\n\n  return obj;\n}\n\n// =============================================================================\n// REQUEST SIZE LIMITING\n// =============================================================================\n\n/**\n * Limit request body size to prevent DoS attacks\n */\nexport const limitRequestSize = (maxSize: string = '10mb') => {\n  return (req: Request, res: Response, next: NextFunction) => {\n    const contentLength = req.get('content-length');\n    \n    if (contentLength) {\n      const sizeInBytes = parseInt(contentLength, 10);\n      const maxSizeInBytes = parseSize(maxSize);\n      \n      if (sizeInBytes > maxSizeInBytes) {\n        return res.status(413).json({\n          success: false,\n          error: 'Payload Too Large',\n          message: `Request body size exceeds limit of ${maxSize}`,\n        });\n      }\n    }\n    \n    next();\n  };\n};\n\n/**\n * Parse size string (e.g., '10mb', '500kb') to bytes\n */\nfunction parseSize(size: string): number {\n  const units: { [key: string]: number } = {\n    b: 1,\n    kb: 1024,\n    mb: 1024 * 1024,\n    gb: 1024 * 1024 * 1024,\n  };\n  \n  const match = size.toLowerCase().match(/^(\\d+(?:\\.\\d+)?)\\s*([kmg]?b)$/);\n  \n  if (!match) {\n    throw new Error(`Invalid size format: ${size}`);\n  }\n  \n  const [, number, unit] = match;\n  return parseFloat(number) * units[unit];\n}\n\n// =============================================================================\n// VALIDATION MIDDLEWARE\n// =============================================================================\n\n/**\n * Validation error handler\n */\nexport const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {\n  const errors = validationResult(req);\n  \n  if (!errors.isEmpty()) {\n    return res.status(400).json({\n      success: false,
      error: 'Validation Error',
      message: 'Input validation failed',
      details: errors.array().map(error => ({\n        field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined,
    })),
  }\n  \n  next();\n};\n\n/**\n * Zod validation middleware factory\n */\nexport const validateZod = (schema: z.ZodSchema<any>, source: 'body' | 'query' | 'params' = 'body') => {\n  return (req: Request, res: Response, next: NextFunction) => {\n    try {\n      const data = source === 'body' ? req.body : \n                  source === 'query' ? req.query : \n                  req.params;\n      \n      schema.parse(data);\n      next();\n    } catch (error) {\n      if (error instanceof z.ZodError) {\n        return res.status(400).json({\n          success: false,
      error: 'Validation Error',
      message: 'Input validation failed',
      details: error.errors.map(err => ({\n        field: err.path.join('.'),
      message: err.message,
      code: err.code,
    })),
  });\n  \n  next(error);\n  };\n};\n\n// =============================================================================\n// SECURITY HEADERS\n// =============================================================================\n\n/**\n * Additional security headers\n */\nexport const additionalSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {\n  // Remove server information\n  res.removeHeader('X-Powered-By');\n  \n  // Add custom security headers\n  res.setHeader('X-API-Version', process.env.API_VERSION || '1.0');\n  res.setHeader('X-Rate-Limit-Policy', 'https://api.nextgen-marketplace.com/rate-limits');\n  res.setHeader('X-Security-Policy', 'https://nextgen-marketplace.com/security');\n  \n  next();\n};\n\n// =============================================================================\n// IP WHITELISTING/BLACKLISTING\n// =============================================================================\n\n/**\n * IP whitelist middleware (for admin endpoints)\n */\nexport const ipWhitelist = (allowedIPs: string[]) => {\n  return (req: Request, res: Response, next: NextFunction) => {\n    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;\n    \n    if (!allowedIPs.includes(clientIP!)) {\n      return res.status(403).json({\n        success: false,
      error: 'Access Denied',
      message: 'Your IP address is not authorized to access this endpoint',
    });\n    \n    next();\n  };\n};\n\n/**\n * IP blacklist middleware\n */\nexport const ipBlacklist = (blockedIPs: string[]) => {\n  return (req: Request, res: Response, next: NextFunction) => {\n    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;\n    \n    if (blockedIPs.includes(clientIP!)) {\n      return res.status(403).json({\n        success: false,
      error: 'Access Denied',
      message: 'Your IP address has been blocked',
    });\n    \n    next();\n  };\n};\n\n// =============================================================================\n// SECURITY MIDDLEWARE STACK\n// =============================================================================\n\n/**\n * Complete security middleware stack\n */\nexport const securityStack = [\n  helmetConfig,\n  enforceHTTPS,\n  mongoSanitize({\n    replaceWith: '_',\n    onSanitize: ({ req, key }) => {\n      console.warn(`[SECURITY] NoSQL injection attempt detected: ${key} from IP: ${req.ip}`);\n    },\n  }),\n  hpp({\n    whitelist: ['tags', 'categories'], // Allow duplicate parameters for these fields\n  }),\n  sanitizeInput,\n  additionalSecurityHeaders,\n  limitRequestSize('10mb'),\n];\n\n// =============================================================================\n// COMMON VALIDATION SCHEMAS\n// =============================================================================\n\nexport const commonValidation = {\n  // Email validation\n  email: body('email')\n    .isEmail()\n    .normalizeEmail()\n    .isLength({ min: 5, max: 255 })\n    .withMessage('Valid email is required'),\n  \n  // Password validation\n  password: body('password')\n    .isLength({ min: 8, max: 128 })\n    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]/, 'g')\n    .withMessage('Password must contain at least 8 characters, including uppercase, lowercase, number and special character'),\n  \n  // Username validation\n  username: body('username')\n    .isLength({ min: 3, max: 30 })\n    .matches(/^[a-zA-Z0-9_]+$/)\n    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),\n  \n  // MongoDB ObjectId validation\n  mongoId: (field: string) => body(field)\n    .matches(/^[0-9a-fA-F]{24}$/)\n    .withMessage(`${field} must be a valid MongoDB ObjectId`),\n  \n  // CUID validation (for Prisma)\n  cuid: (field: string) => body(field)\n    .matches(/^c[a-z0-9]{24}$/)\n    .withMessage(`${field} must be a valid CUID`),\n};\n\nexport default {\n  generalRateLimit,\n  authRateLimit,\n  passwordResetRateLimit,\n  createApiKeyRateLimit,\n  helmetConfig,\n  enforceHTTPS,\n  sanitizeInput,\n  limitRequestSize,\n  handleValidationErrors,\n  validateZod,\n  additionalSecurityHeaders,\n  ipWhitelist,\n  ipBlacklist,\n  securityStack,\n  commonValidation,\n};"