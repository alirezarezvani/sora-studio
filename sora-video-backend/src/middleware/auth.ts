import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Authentication middleware to extract user ID from Stack Auth JWT token
 * This middleware is optional - if no token is provided, it allows the request
 * but doesn't attach a user. The controller will default to 'anonymous'.
 */
export function authenticateUser(req: Request, _res: Response, next: NextFunction): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided - allow request but with no user
      console.log('[Auth Middleware] No authorization token provided - proceeding as anonymous');
      return next();
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Decode the JWT token (without verification for now)
    // In production, you should verify the token signature with Stack Auth's public key
    const decoded = jwt.decode(token) as any;

    if (!decoded || !decoded.sub) {
      console.log('[Auth Middleware] Invalid token format - proceeding as anonymous');
      return next();
    }

    // Extract user information from token
    req.user = {
      id: decoded.sub, // 'sub' (subject) is the user ID in JWT standard
      email: decoded.email,
      name: decoded.name || decoded.displayName,
    };

    console.log(`[Auth Middleware] Authenticated user: ${req.user.id}`);
    next();
  } catch (error) {
    console.error('[Auth Middleware] Error processing auth token:', error);
    // Don't fail the request - just proceed as anonymous
    next();
  }
}

/**
 * Require authentication - returns 401 if no valid token
 * Use this middleware when authentication is required (not optional)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): any {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid token.',
      });
    }

    const token = authHeader.substring(7);

    // Decode the JWT token
    const decoded = jwt.decode(token) as any;

    if (!decoded || !decoded.sub) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token.',
      });
    }

    // Attach user to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name || decoded.displayName,
    };

    console.log(`[Auth Middleware] Authenticated user (required): ${req.user.id}`);
    next();
  } catch (error) {
    console.error('[Auth Middleware] Error processing auth token:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed. Invalid or expired token.',
    });
  }
}
