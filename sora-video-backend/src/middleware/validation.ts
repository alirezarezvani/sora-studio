import { Request, Response, NextFunction } from 'express';

/**
 * Validation middleware for video creation requests
 */
export function validateCreateVideo(req: Request, res: Response, next: NextFunction): any {
  const { prompt, model, size, seconds, quality } = req.body;

  // Validate prompt
  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'Prompt is required',
    });
  }

  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Prompt must be a non-empty string',
    });
  }

  if (prompt.length > 1000) {
    return res.status(400).json({
      success: false,
      error: 'Prompt is too long (maximum 1000 characters)',
    });
  }

  // Validate model if provided
  if (model && !['sora-2', 'sora-2-pro'].includes(model)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid model. Must be "sora-2" or "sora-2-pro"',
    });
  }

  // Validate size if provided
  if (size) {
    const validSizes = ['1024x1808', '1808x1024', '1024x1024'];
    if (!validSizes.includes(size)) {
      return res.status(400).json({
        success: false,
        error: `Invalid size. Must be one of: ${validSizes.join(', ')}`,
      });
    }
  }

  // Validate seconds if provided
  if (seconds) {
    const validSeconds = ['5', '8', '10'];
    if (!validSeconds.includes(seconds)) {
      return res.status(400).json({
        success: false,
        error: `Invalid duration. Must be one of: ${validSeconds.join(', ')} seconds`,
      });
    }
  }

  // Validate quality if provided
  if (quality && !['standard', 'high'].includes(quality)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid quality. Must be "standard" or "high"',
    });
  }

  next();
}

/**
 * Validation middleware for remix requests
 */
export function validateRemixVideo(req: Request, res: Response, next: NextFunction): any {
  const { prompt } = req.body;

  // Validate prompt
  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'Remix prompt is required',
    });
  }

  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Remix prompt must be a non-empty string',
    });
  }

  if (prompt.length > 1000) {
    return res.status(400).json({
      success: false,
      error: 'Remix prompt is too long (maximum 1000 characters)',
    });
  }

  next();
}

/**
 * Validation middleware for video ID parameter
 */
export function validateVideoId(req: Request, res: Response, next: NextFunction): any {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Valid video ID is required',
    });
  }

  // OpenAI video IDs typically start with "video_"
  if (!id.startsWith('video_')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid video ID format',
    });
  }

  next();
}

/**
 * Validation middleware for list query parameters
 */
export function validateListQuery(req: Request, res: Response, next: NextFunction): any {
  const { limit, after } = req.query;

  // Validate limit if provided
  if (limit) {
    const limitNum = parseInt(limit as string);

    if (isNaN(limitNum)) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be a number',
      });
    }

    if (limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100',
      });
    }
  }

  // Validate after cursor if provided
  if (after && typeof after !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'After cursor must be a string',
    });
  }

  next();
}

/**
 * General request validation middleware
 */
export function validateRequest(req: Request, res: Response, next: NextFunction): any {
  // Check Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];

    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        error: 'Content-Type must be application/json',
      });
    }
  }

  next();
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): any {
  // Sanitize prompt if present
  if (req.body.prompt && typeof req.body.prompt === 'string') {
    // Remove any potentially harmful characters
    req.body.prompt = req.body.prompt
      .replace(/[<>]/g, '') // Remove < and >
      .trim();
  }

  next();
}
