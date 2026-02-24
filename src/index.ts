/**
 * @fileoverview Entry point for the Library API server.
 *
 * This module bootstraps the Express application by:
 *  1. Configuring global middleware (CORS, body parsing, request logging)
 *  2. Mounting the resource routers (authors, books)
 *  3. Providing a health-check endpoint
 *  4. Attaching the centralized error handler
 *  5. Starting the HTTP server on the configured port
 *
 * The server listens on the port defined by the PORT environment variable,
 * falling back to 3000 if not set. All data is stored in-memory, so it
 * resets when the server restarts.
 *
 * @example
 *   # Development (with hot-reload):
 *   npm run dev
 *
 *   # Production:
 *   npm run build && npm start
 */

import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authorsRouter from './routes/authors';
import booksRouter from './routes/books';
import { logger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { HealthCheckResponse } from './types';

// ─── Application Setup ──────────────────────────────────────────────────────

/** Create the Express application instance */
const app: Application = express();

// ─── Global Middleware ───────────────────────────────────────────────────────

/**
 * Enable Cross-Origin Resource Sharing (CORS) for all origins.
 * This allows the API to be consumed by frontend clients hosted
 * on different domains during development and production.
 */
app.use(cors());

/**
 * Parse incoming JSON request bodies.
 * Populates req.body with the parsed JSON data for POST / PUT requests.
 */
app.use(bodyParser.json());

/**
 * Log every incoming request (method + URL + timestamp).
 * Must be mounted before route handlers to capture all requests.
 */
app.use(logger);

// ─── Route Mounting ──────────────────────────────────────────────────────────

/** Author resource routes (CRUD + nested books) */
app.use('/authors', authorsRouter);

/** Book resource routes (CRUD + filtering/sorting/pagination) */
app.use('/books', booksRouter);

// ─── Health Check ────────────────────────────────────────────────────────────

/**
 * GET /
 * Simple health-check endpoint to verify the API is running.
 * Returns a JSON object with status and the current server timestamp.
 *
 * Useful for uptime monitoring, load balancer probes, and deployment checks.
 */
app.get('/', (_req: Request, res: Response): void => {
  const response: HealthCheckResponse = {
    status: 'ok',
    timestamp: Date.now(),
  };
  res.json(response);
});

// ─── Error Handling ──────────────────────────────────────────────────────────

/**
 * Centralized error handler — MUST be mounted LAST (after all routes).
 * Express identifies it as an error handler by its 4-parameter signature.
 * Catches any unhandled errors thrown or passed via next(err) from route handlers.
 */
app.use(errorHandler);

// ─── Server Startup ──────────────────────────────────────────────────────────

/** Port to listen on — configurable via environment variable */
const PORT: number = parseInt(process.env.PORT || '3000', 10);

/**
 * Start the HTTP server and log the listening URL.
 * The callback fires once the server is ready to accept connections.
 */
app.listen(PORT, (): void => {
  console.log(`Library API listening on http://localhost:${PORT}`);
});
