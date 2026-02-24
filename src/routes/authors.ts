/**
 * @fileoverview Authors router — CRUD endpoints for the Author resource.
 *
 * Mounted at `/authors` in the main application (index.ts).
 * All handlers operate on the in-memory authors array from the model.
 *
 * Endpoints:
 *   POST   /authors          — Create a new author
 *   GET    /authors          — List all authors
 *   GET    /authors/:id      — Get a single author by ID
 *   PUT    /authors/:id      — Update an existing author
 *   DELETE /authors/:id      — Delete an author (cascades to books)
 *   GET    /authors/:id/books — List all books by a specific author
 */

import { Router, Request, Response } from 'express';
import { authors, getNextAuthorId } from '../models/author';
import { books } from '../models/book';
import { validateAuthorPayload } from '../middleware/validation';
import { CreateAuthorBody, Author, Book, ApiErrorResponse, DeleteResponse } from '../types';

const router: Router = Router();

// ─── CREATE ──────────────────────────────────────────────────────────────────

/**
 * POST /authors
 * Creates a new author after validation.
 *
 * Request body: { name: string, bio?: string }
 * Responses:
 *   201 — Author created successfully (returns the new Author object)
 *   400 — Validation failed (handled by validateAuthorPayload middleware)
 *   409 — An author with the same name already exists
 */
router.post('/', validateAuthorPayload, (req: Request, res: Response): void => {
  const { name, bio } = req.body as CreateAuthorBody;

  // Check for duplicate author names (case-insensitive comparison)
  const duplicate: Author | undefined = authors.find(
    (a) => a.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (duplicate) {
    res.status(409).json({ error: 'Author already exists.' } as ApiErrorResponse);
    return;
  }

  // Generate the next unique ID using the model helper
  const id: number = getNextAuthorId();

  // Create the new author entity and add it to the data store
  const author: Author = { id, name: name.trim(), bio };
  authors.push(author);

  // Return 201 Created with the new author object
  res.status(201).json(author);
});

// ─── READ (LIST ALL) ─────────────────────────────────────────────────────────

/**
 * GET /authors
 * Returns the complete list of authors in the data store.
 *
 * Response: Author[]
 */
router.get('/', (_req: Request, res: Response): void => {
  res.json(authors);
});

// ─── READ (SINGLE) ──────────────────────────────────────────────────────────

/**
 * GET /authors/:id
 * Retrieves a single author by their numeric ID.
 *
 * Responses:
 *   200 — Author found (returns the Author object)
 *   404 — No author exists with the given ID
 */
router.get('/:id', (req: Request, res: Response): void => {
  // Parse the route parameter from string to number
  const id: number = Number(req.params.id);

  // Look up the author in the in-memory store
  const author: Author | undefined = authors.find((a) => a.id === id);

  if (!author) {
    res.status(404).json({ error: 'Author not found.' } as ApiErrorResponse);
    return;
  }

  res.json(author);
});

// ─── UPDATE ──────────────────────────────────────────────────────────────────

/**
 * PUT /authors/:id
 * Updates an existing author's name and/or bio.
 *
 * Request body: { name: string, bio?: string }
 * Responses:
 *   200 — Author updated successfully (returns the updated Author object)
 *   400 — Validation failed (handled by validateAuthorPayload middleware)
 *   404 — No author exists with the given ID
 *   409 — Another author already has the requested name
 */
router.put('/:id', validateAuthorPayload, (req: Request, res: Response): void => {
  const id: number = Number(req.params.id);

  // Find the existing author to update
  const author: Author | undefined = authors.find((a) => a.id === id);
  if (!author) {
    res.status(404).json({ error: 'Author not found.' } as ApiErrorResponse);
    return;
  }

  const { name, bio } = req.body as CreateAuthorBody;

  // Ensure the new name doesn't conflict with ANOTHER author's name
  const dup: Author | undefined = authors.find(
    (a) => a.name.toLowerCase() === name.trim().toLowerCase() && a.id !== id
  );
  if (dup) {
    res.status(409).json({ error: 'Another author with the same name exists.' } as ApiErrorResponse);
    return;
  }

  // Apply the updates to the existing author object in-place
  author.name = name.trim();
  author.bio = bio;

  res.json(author);
});

// ─── DELETE ──────────────────────────────────────────────────────────────────

/**
 * DELETE /authors/:id
 * Removes an author from the data store.
 *
 * IMPORTANT: This performs a cascade delete — all books belonging to
 * the deleted author are also removed from the books array. The
 * reverse-iteration pattern (i--) is used to safely splice elements
 * from the array while iterating.
 *
 * Responses:
 *   200 — Author deleted (returns { deleted: Author })
 *   404 — No author exists with the given ID
 */
router.delete('/:id', (req: Request, res: Response): void => {
  const id: number = Number(req.params.id);

  // Find the index of the author to remove
  const index: number = authors.findIndex((a) => a.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Author not found.' } as ApiErrorResponse);
    return;
  }

  // Cascade delete: remove all books belonging to this author.
  // Iterate in reverse so that splice doesn't shift unvisited indices.
  for (let i: number = books.length - 1; i >= 0; i--) {
    if (books[i].authorId === id) {
      books.splice(i, 1);
    }
  }

  // Remove the author from the array
  const removed: Author = authors.splice(index, 1)[0];

  const response: DeleteResponse<Author> = { deleted: removed };
  res.json(response);
});

// ─── NESTED: BOOKS BY AUTHOR ─────────────────────────────────────────────────

/**
 * GET /authors/:id/books
 * Lists all books written by a specific author.
 *
 * This is a nested resource endpoint that first verifies the author
 * exists, then filters the books array by authorId.
 *
 * Responses:
 *   200 — Array of books (may be empty if the author has no books)
 *   404 — No author exists with the given ID
 */
router.get('/:id/books', (req: Request, res: Response): void => {
  const id: number = Number(req.params.id);

  // Verify the author exists before returning their books
  const author: Author | undefined = authors.find((a) => a.id === id);
  if (!author) {
    res.status(404).json({ error: 'Author not found.' } as ApiErrorResponse);
    return;
  }

  // Filter books belonging to this author
  const authorBooks: Book[] = books.filter((b) => b.authorId === id);
  res.json(authorBooks);
});

export default router;
