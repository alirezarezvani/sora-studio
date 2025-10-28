import { Request, Response } from 'express';
import pool from '../config/database.js';
import redis from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Health check status interface
 */
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: CheckResult;
    redis: CheckResult;
    openai?: CheckResult;
  };
}

interface CheckResult {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  message?: string;
}

/**
 * Check database connection
 */
async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();
  try {
    await pool.query('SELECT 1');
    return {
      status: 'up',
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    logger.error('Database health check failed', { error: error.message });
    return {
      status: 'down',
      message: error.message,
    };
  }
}

/**
 * Check Redis connection
 */
async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();
  try {
    if (!redis || !redis.isOpen) {
      return {
        status: 'down',
        message: 'Redis client not connected',
      };
    }

    await redis.ping();
    return {
      status: 'up',
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    // Redis is optional, so degraded instead of down
    logger.warn('Redis health check failed', { error: error.message });
    return {
      status: 'degraded',
      message: error.message,
    };
  }
}

/**
 * Determine overall health status
 */
function determineOverallStatus(checks: HealthStatus['checks']): 'healthy' | 'degraded' | 'unhealthy' {
  // Critical services: database
  if (checks.database.status === 'down') {
    return 'unhealthy';
  }

  // Optional services: redis
  if (checks.redis.status === 'down' || checks.redis.status === 'degraded') {
    return 'degraded';
  }

  return 'healthy';
}

/**
 * Basic health check endpoint
 * Returns 200 if service is running
 */
export async function healthCheck(_req: Request, res: Response): Promise<void> {
  const uptime = process.uptime();

  // Quick health check - just confirms the service is running
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    service: 'Sora Studio API',
  });
}

/**
 * Comprehensive readiness check
 * Checks all dependencies before marking as ready
 */
export async function readinessCheck(_req: Request, res: Response): Promise<void> {
  try {
    // Run all checks in parallel
    const [databaseCheck, redisCheck] = await Promise.all([
      checkDatabase(),
      checkRedis(),
    ]);

    const checks = {
      database: databaseCheck,
      redis: redisCheck,
    };

    const overallStatus = determineOverallStatus(checks);

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks,
    };

    // Return appropriate status code
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthStatus);
  } catch (error: any) {
    logger.error('Readiness check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Failed to perform readiness check',
    });
  }
}

/**
 * Liveness check endpoint
 * Simple check that the process is alive
 */
export async function livenessCheck(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
}
