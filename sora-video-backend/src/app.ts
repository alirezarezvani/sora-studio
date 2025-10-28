import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection as testDbConnection } from './config/database.js';
import { testConnection as testOpenAIConnection } from './config/openai.js';
import { initRedis } from './config/redis.js';
import videoRoutes from './routes/video.routes.js';
import quotaRoutes from './routes/quota.routes.js';
import statusUpdater from './workers/status-updater.js';
import { authenticateUser } from './middleware/auth.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { requestLogger, requestBodyLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { healthCheck, readinessCheck, livenessCheck } from './middleware/healthCheck.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware - Order matters!
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (must be before routes)
app.use(requestLogger);
app.use(requestBodyLogger);

// Routes placeholder
app.get('/', (_req, res) => {
  res.json({
    message: 'Sora Studio API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/docs',
  });
});

// Health check endpoints
app.get('/health', healthCheck); // Basic health
app.get('/health/ready', readinessCheck); // Readiness probe (checks dependencies)
app.get('/health/live', livenessCheck); // Liveness probe (process alive)

// API Routes
// Apply rate limiting and authentication middleware to all API routes
app.use('/api', apiLimiter); // Rate limit all API endpoints
app.use('/api/videos', authenticateUser, videoRoutes);
app.use('/api/quota', authenticateUser, quotaRoutes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test connections
    logger.info('Testing connections...');
    await testDbConnection();
    await testOpenAIConnection();
    await initRedis();

    // Start background worker for status updates
    logger.info('Starting background worker...');
    statusUpdater.start();

    // Start server
    app.listen(PORT, () => {
      logger.info('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
        features: {
          statusUpdater: true,
          redis: true,
          database: true,
        },
      });
    });
  } catch (error: any) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  statusUpdater.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  statusUpdater.stop();
  process.exit(0);
});

startServer();

export default app;
