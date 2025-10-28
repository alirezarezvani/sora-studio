import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

/**
 * Custom error class with HTTP status code
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguish from programming errors
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Predefined error classes for common scenarios
 */
export class BadRequestError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 400, code || 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code?: string) {
    super(message, 401, code || 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code?: string) {
    super(message, 403, code || 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code?: string) {
    super(message, 404, code || 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 409, code || 'CONFLICT');
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests', code?: string) {
    super(message, 429, code || 'TOO_MANY_REQUESTS');
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', code?: string) {
    super(message, 500, code || 'INTERNAL_SERVER_ERROR');
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service unavailable', code?: string) {
    super(message, 503, code || 'SERVICE_UNAVAILABLE');
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    stack?: string;
    details?: any;
  };
}

/**
 * Format error response
 */
function formatErrorResponse(err: any, includeStack: boolean = false): ErrorResponse {
  return {
    success: false,
    error: {
      message: err.message || 'An unexpected error occurred',
      code: err.code || 'INTERNAL_ERROR',
      statusCode: err.statusCode || 500,
      ...(includeStack && { stack: err.stack }),
      ...(err.details && { details: err.details }),
    },
  };
}

/**
 * Comprehensive error handling middleware
 * This should be the last middleware in the chain
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Determine if this is an operational error
  const isOperational = err.isOperational || err.statusCode || false;

  // Set default status code
  const statusCode = err.statusCode || 500;

  // Log the error
  if (statusCode >= 500) {
    // Server errors - log with full details
    logger.error('Server Error', {
      message: err.message,
      code: err.code,
      statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userId: (req as any).user?.id || 'anonymous',
    });
  } else if (statusCode >= 400) {
    // Client errors - log as warnings
    logger.warn('Client Error', {
      message: err.message,
      code: err.code,
      statusCode,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  }

  // Handle specific error types
  let response = formatErrorResponse(err, process.env.NODE_ENV === 'development');

  // OpenAI API errors
  if (err.constructor.name === 'PermissionDeniedError' || err.constructor.name === 'APIError') {
    response = formatErrorResponse(
      {
        message: 'External API error',
        code: 'EXTERNAL_API_ERROR',
        statusCode: err.status || 500,
        details: {
          service: 'OpenAI',
          originalMessage: err.message,
        },
      },
      process.env.NODE_ENV === 'development'
    );
  }

  // Database errors
  if (err.code === '23505') {
    // PostgreSQL unique violation
    response = formatErrorResponse(
      {
        message: 'Resource already exists',
        code: 'DUPLICATE_RESOURCE',
        statusCode: 409,
      },
      false
    );
  }

  if (err.code === '23503') {
    // PostgreSQL foreign key violation
    response = formatErrorResponse(
      {
        message: 'Referenced resource not found',
        code: 'INVALID_REFERENCE',
        statusCode: 400,
      },
      false
    );
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    response = formatErrorResponse(
      {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: err.details || err.errors,
      },
      false
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    response = formatErrorResponse(
      {
        message: 'Invalid authentication token',
        code: 'INVALID_TOKEN',
        statusCode: 401,
      },
      false
    );
  }

  if (err.name === 'TokenExpiredError') {
    response = formatErrorResponse(
      {
        message: 'Authentication token expired',
        code: 'TOKEN_EXPIRED',
        statusCode: 401,
      },
      false
    );
  }

  // Redis errors - treat as operational but log
  if (err.message?.includes('Redis') || err.message?.includes('ECONNREFUSED')) {
    logger.error('Redis Connection Error', {
      message: err.message,
      stack: err.stack,
    });
  }

  // Send response
  res.status(statusCode).json(response);

  // For non-operational errors, this might indicate a bug
  if (!isOperational) {
    logger.error('Non-operational error detected - possible bug', {
      error: err.message,
      stack: err.stack,
    });
  }
}

/**
 * Not found handler (404)
 * Should be placed before error handler but after all routes
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  const error = new NotFoundError(`Route not found: ${req.method} ${req.path}`);
  next(error);
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass to error middleware
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
