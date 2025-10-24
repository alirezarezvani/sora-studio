import rateLimit from 'express-rate-limit';

/**
 * Rate limiting for video creation endpoint
 * Limits per authenticated user to prevent abuse
 *
 * Limits:
 * - 10 videos per hour per user (production-ready limit)
 * - Returns 429 Too Many Requests when exceeded
 */
export const videoCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 video creations per hour
  message: {
    success: false,
    error: 'Too many video creation requests. Please try again later.',
    retry_after: '1 hour',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use user ID as the key for rate limiting (per user, not per IP)
  keyGenerator: (req) => {
    return req.user?.id || req.ip || 'anonymous';
  },
  // Skip rate limiting for successful requests that don't actually create videos
  skip: (_req, res) => {
    return res.statusCode !== 201; // Only count successful creations (201)
  },
  handler: (req, res) => {
    console.log(`[RateLimit] User ${req.user?.id || 'anonymous'} exceeded video creation rate limit`);
    res.status(429).json({
      success: false,
      error: 'Too many video creation requests. Please try again in 1 hour.',
      rate_limit: {
        limit: 10,
        window: '1 hour',
        retry_after: Math.ceil((60 * 60 * 1000) / 1000), // seconds
      },
    });
  },
});

/**
 * General API rate limiting
 * Applies to all API endpoints to prevent abuse
 *
 * Limits:
 * - 100 requests per 15 minutes per user
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each user to 100 requests per 15 minutes
  message: {
    success: false,
    error: 'Too many requests. Please slow down.',
    retry_after: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || req.ip || 'anonymous';
  },
  handler: (req, res) => {
    console.log(`[RateLimit] User ${req.user?.id || 'anonymous'} exceeded general API rate limit`);
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please slow down and try again in 15 minutes.',
      rate_limit: {
        limit: 100,
        window: '15 minutes',
        retry_after: Math.ceil((15 * 60 * 1000) / 1000), // seconds
      },
    });
  },
});
