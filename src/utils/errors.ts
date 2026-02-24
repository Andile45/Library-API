/**
 * @fileoverview Custom error utility for the Library API.
 *
 * Provides a typed AppError class that extends the built-in Error.
 * This allows route handlers to throw errors with an HTTP status code,
 * which the centralized error-handling middleware can then extract
 * instead of defaulting to 500 for every error.
 *
 * @example
 *   // In a route handler:
 *   import { AppError } from '../utils/errors';
 *   throw new AppError(404, 'Author not found.');
 */

/**
 * Custom application error with an attached HTTP status code.
 *
 * By extending the native Error class, this integrates seamlessly
 * with Express error-handling middleware while carrying structured
 * status information.
 */
export class AppError extends Error {
    /** HTTP status code to return in the error response */
    public readonly status: number;

    /**
     * Creates a new AppError instance.
     *
     * @param status - HTTP status code (e.g. 400, 404, 409, 500)
     * @param message - Human-readable error description sent to the client
     */
    constructor(status: number, message: string) {
        super(message);

        this.status = status;

        // Maintain proper prototype chain for instanceof checks.
        // Required when extending built-in classes in TypeScript / ES6+.
        Object.setPrototypeOf(this, AppError.prototype);

        // Capture a clean stack trace (excludes the constructor frame)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }
}
