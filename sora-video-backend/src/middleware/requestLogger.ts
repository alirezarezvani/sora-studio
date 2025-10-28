import { Request, Response, NextFunction } from 'express';
import { loggers } from '../utils/logger.js';

/**
 * Request/Response logging middleware
 * Logs all HTTP requests with timing information
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Log request start
  const requestInfo = {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id || 'anonymous',
  };

  // Capture response
  const originalSend = res.send;
  let responseBody: any;

  res.send = function (data): Response {
    responseBody = data;
    return originalSend.call(this, data);
  };

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { method, url } = requestInfo;

    // Determine log level based on status code
    const statusCode = res.statusCode;

    // Skip health check logs in production (too noisy)
    if (process.env.NODE_ENV === 'production' && url.includes('/health')) {
      return;
    }

    loggers.request(method, url, statusCode, duration, {
      ip: requestInfo.ip,
      userId: requestInfo.userId,
      ...(statusCode >= 400 && { userAgent: requestInfo.userAgent }),
    });
  });

  next();
}

/**
 * Request body logger (for debugging)
 * Only logs in development mode
 */
export function requestBodyLogger(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV !== 'development') {
    return next();
  }

  if (req.body && Object.keys(req.body).length > 0) {
    // Sanitize sensitive data
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '***REDACTED***';
    if (sanitizedBody.token) sanitizedBody.token = '***REDACTED***';
    if (sanitizedBody.apiKey) sanitizedBody.apiKey = '***REDACTED***';

    console.log(`[Request Body] ${req.method} ${req.url}:`, sanitizedBody);
  }

  next();
}
