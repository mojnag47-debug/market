import { NextFunction, Request, Response } from 'express';
import { AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError } from '../shared/types';
import { logger } from '../shared/logger';
import { trace } from '@opentelemetry/api';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tracer = trace.getTracer('error-handler');
  return tracer.startActiveSpan('errorHandler', (span) => {
    try {
      let statusCode = 500;
      const errorResponse: {
        success: boolean;
        error: string;
        message?: string;
        details?: any;
        stack?: string;
      } = {
        success: false,
        error: 'Internal Server Error'
      };

      // Handle known error types
      if (err instanceof ValidationError) {
        statusCode = 400;
        errorResponse.error = 'Validation Error';
        errorResponse.details = err.errors;
      } else if (err instanceof UnauthorizedError) {
        statusCode = 401;
        errorResponse.error = 'Unauthorized';
      } else if (err instanceof ForbiddenError) {
        statusCode = 403;
        errorResponse.error = 'Forbidden';
      } else if (err instanceof NotFoundError) {
        statusCode = 404;
        errorResponse.error = 'Not Found';
      } else if (err instanceof ConflictError) {
        statusCode = 409;
        errorResponse.error = 'Conflict';
      } else if (err instanceof AppError) {
        statusCode = err.statusCode || 500;
        errorResponse.error = err.message;
      }

      // Logging
      const logContext = {
        error: err.stack,
        path: req.path,
        method: req.method,
        params: req.params,
        query: req.query,
        body: req.body,
        user: req.user?.id,
        statusCode
      };

      if (statusCode >= 500) {
        logger.error(err.message, logContext);
        span.setAttribute('error.severity', 'high');
      } else if (statusCode >= 400) {
        logger.warn(err.message, logContext);
        span.setAttribute('error.severity', 'medium');
      }

      // Add stack trace in development
      if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
      }

      span.setAttribute('http.status_code', statusCode);
      span.setAttribute('error.message', err.message);
      span.setAttribute('error.type', err.name);

      res.status(statusCode).json(errorResponse);
    } catch (handlerError) {
      logger.error('Error handler failed', {
        originalError: err,
        handlerError
      });
      res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    } finally {
      span.end();
    }
  });
};