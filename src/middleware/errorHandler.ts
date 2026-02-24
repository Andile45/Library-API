/**
 * @fileoverview Centralized error-handling middleware for the Library API.
 *
 * Express identifies error-handling middleware by its four-parameter
 * signature (err, req, res, next). This middleware is mounted LAST
 * in the middleware chain (in index.ts) so that it catches any errors
 * thrown or passed via next(err) from route handlers.
 *
 * It works with the custom AppError class (src/utils/errors.ts) to
 * extract structured status codes. For unexpected errors it falls
 * back to a generic 500 Internal Server Error response.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ApiErrorResponse } from '../types';

/**
 * Global error handler — catches all unhandled errors in the request pipeline.
 *
 * Design decisions:
 * - If headers have already been sent to the client, delegates to Express's
 *   default error handler to avoid corrupting the response stream.
 * - Extracts the HTTP status from AppError instances; defaults to 500 otherwise.
 * - Always returns a consistent JSON error shape: { error: string }.
 * - Logs the full error to the console for server-side debugging.
 *
 * @param err  - The error object (AppError or generic Error)
 * @param req  - Express request object
 * @param res  - Express response object
 * @param next - Callback to delegate to Express's default error handler
 */
export function errorHandler(
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error details for server-side debugging
  console.error('Error handler caught:', err);

  // If the response has already started streaming, let Express handle it
  if (res.headersSent) {
    return next(err);
  }

  // Extract status code: AppError has a typed .status, otherwise default to 500
  const status: number = err instanceof AppError ? err.status : 500;
  const message: string = err.message || 'Internal Server Error';

  // Return a consistent JSON error response
  const errorResponse: ApiErrorResponse = { error: message };
  res.status(status).json(errorResponse);
}
