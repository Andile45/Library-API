/**
 * @fileoverview Request body validation middleware for the Library API.
 *
 * Provides middleware functions that validate incoming request bodies
 * before they reach the route handlers. Each validator checks for
 * required fields, correct types, and business-rule constraints
 * (e.g. authorId must reference an existing author).
 *
 * Validators are applied per-route using Express's middleware chaining:
 *   router.post('/', validateAuthorPayload, handler);
 *
 * If validation fails, a 400 Bad Request response is returned immediately
 * and the route handler is never invoked.
 */

import { Request, Response, NextFunction } from 'express';
import { authors } from '../models/author';
import { CreateAuthorBody, CreateBookBody, ApiErrorResponse } from '../types';

/**
 * Validates the request body for creating or updating an Author.
 *
 * Checks:
 * - `name` is present, is a string, and is non-empty after trimming
 *
 * @param req  - Express request object (body should match CreateAuthorBody)
 * @param res  - Express response object (used to send 400 on failure)
 * @param next - Callback to pass control to the route handler on success
 */
export function validateAuthorPayload(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { name } = req.body as CreateAuthorBody;

  // Ensure name is a non-empty string after trimming whitespace
  if (!name || typeof name !== 'string' || !name.trim()) {
    const errorResponse: ApiErrorResponse = {
      error: 'Author validation failed: "name" is required (non-empty string).',
    };
    res.status(400).json(errorResponse);
    return;
  }

  next();
}

/**
 * Validates the request body for creating or updating a Book.
 *
 * Checks (in order):
 * 1. `title`    — required, must be a non-empty string
 * 2. `authorId` — required, must be a number referencing an existing Author
 * 3. `year`     — optional, but if provided must be a number
 *
 * The authorId foreign-key check queries the in-memory authors array
 * to confirm the referenced author actually exists before allowing
 * the book to be created or updated.
 *
 * @param req  - Express request object (body should match CreateBookBody)
 * @param res  - Express response object (used to send 400 on failure)
 * @param next - Callback to pass control to the route handler on success
 */
export function validateBookPayload(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { title, authorId, year } = req.body as CreateBookBody;

  // 1. Validate title — must be a non-empty string
  if (!title || typeof title !== 'string' || !title.trim()) {
    const errorResponse: ApiErrorResponse = {
      error: 'Book validation failed: "title" is required (non-empty string).',
    };
    res.status(400).json(errorResponse);
    return;
  }

  // 2. Validate authorId — must be a number
  if (authorId === undefined || typeof authorId !== 'number') {
    const errorResponse: ApiErrorResponse = {
      error: 'Book validation failed: "authorId" is required (number).',
    };
    res.status(400).json(errorResponse);
    return;
  }

  // 3. Verify the referenced author exists in the data store
  const authorExists: boolean = authors.some((a) => a.id === authorId);
  if (!authorExists) {
    const errorResponse: ApiErrorResponse = {
      error: 'Book validation failed: referenced authorId does not exist.',
    };
    res.status(400).json(errorResponse);
    return;
  }

  // 4. Validate year — optional, but must be a number if provided
  if (year !== undefined && typeof year !== 'number') {
    const errorResponse: ApiErrorResponse = {
      error: 'Book validation failed: "year" must be a number if provided.',
    };
    res.status(400).json(errorResponse);
    return;
  }

  next();
}
