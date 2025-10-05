import { RequestHandler, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pinoHttp from 'pino-http';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

import pino from 'pino';
const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

export const requestIdMiddleware: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const id = req.headers['x-request-id'] as string | undefined ?? uuidv4();
  // Attach to request for later use
  (req as unknown as { id?: string }).id = id;
  // Ensure header
  req.headers['x-request-id'] = id;
  next();
};

export const loggerMiddleware = pinoHttp({ logger });

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  xssFilter: true,
});

export const sanitizeMiddlewares: RequestHandler[] = [mongoSanitize(), xss()];

// Rate limiters
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' },
});

export const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

export function applySecurity(app: { use: (m: RequestHandler | RequestHandler[]) => void }) {
  app.use(requestIdMiddleware);
  app.use(loggerMiddleware);
  app.use(helmetMiddleware);
  sanitizeMiddlewares.forEach((m) => app.use(m));
}
