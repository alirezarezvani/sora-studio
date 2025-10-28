import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Define log format
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;

  // Add stack trace for errors
  if (stack) {
    msg += `\n${stack}`;
  }

  // Add metadata if present
  if (Object.keys(metadata).length > 0) {
    msg += `\n${JSON.stringify(metadata, null, 2)}`;
  }

  return msg;
});

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Configure transports
const transports: winston.transport[] = [];

// Console transport (for development)
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      ),
    })
  );
}

// File transport for errors (always enabled)
transports.push(
  new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxFiles: '14d', // Keep logs for 14 days
    maxSize: '20m', // Rotate at 20MB
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      logFormat
    ),
  })
);

// File transport for all logs (production)
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      ),
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports,
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
    }),
  ],
});

// Add custom log levels for specific use cases
export const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Helper functions for common log patterns
export const loggers = {
  /**
   * Log API request
   */
  request: (method: string, url: string, statusCode: number, duration: number, metadata?: any) => {
    logger.http('API Request', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      ...metadata,
    });
  },

  /**
   * Log database query
   */
  database: (query: string, duration: number, error?: any) => {
    if (error) {
      logger.error('Database Query Failed', {
        query: query.substring(0, 200), // Truncate long queries
        duration: `${duration}ms`,
        error: error.message,
      });
    } else {
      logger.debug('Database Query', {
        query: query.substring(0, 200),
        duration: `${duration}ms`,
      });
    }
  },

  /**
   * Log external API call
   */
  externalApi: (service: string, endpoint: string, statusCode: number, duration: number, error?: any) => {
    if (error) {
      logger.error('External API Call Failed', {
        service,
        endpoint,
        statusCode,
        duration: `${duration}ms`,
        error: error.message,
      });
    } else {
      logger.info('External API Call', {
        service,
        endpoint,
        statusCode,
        duration: `${duration}ms`,
      });
    }
  },

  /**
   * Log video generation events
   */
  video: (event: string, videoId: string, metadata?: any) => {
    logger.info('Video Event', {
      event,
      videoId,
      ...metadata,
    });
  },

  /**
   * Log authentication events
   */
  auth: (event: string, userId: string, success: boolean, metadata?: any) => {
    if (success) {
      logger.info('Auth Event', {
        event,
        userId,
        success,
        ...metadata,
      });
    } else {
      logger.warn('Auth Event Failed', {
        event,
        userId,
        success,
        ...metadata,
      });
    }
  },

  /**
   * Log security events
   */
  security: (event: string, severity: 'low' | 'medium' | 'high' | 'critical', metadata?: any) => {
    const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    logger.log(level, 'Security Event', {
      event,
      severity,
      ...metadata,
    });
  },
};

export default logger;
