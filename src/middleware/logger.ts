/**
 * @fileoverview Request logger middleware for the Library API.
 *
 * Logs every incoming HTTP request to the console with a timestamp,
 * HTTP method, and the original URL path. This is useful for
 * debugging and monitoring API usage during development.
 *
 * The middleware is mounted globally in index.ts before any route
 * handlers so that every request is captured.
 *
 * @example Console output:
 *   [2024-01-15T10:30:00.000Z] GET /authors
 *   [2024-01-15T10:30:01.500Z] POST /books
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Logs incoming request details to the console.
 *
 * Captures the current ISO timestamp, HTTP method, and original URL,
 * then passes control to the next middleware in the chain via next().
 *
 * @param req - Express request object
 * @param res - Express response object (unused but required by Express signature)
 * @param next - Callback to invoke the next middleware
 */
export function logger(req: Request, res: Response, next: NextFunction): void {
  const now: string = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);
  next();
}
