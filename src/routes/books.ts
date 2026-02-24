/**
 * @fileoverview Books router — CRUD endpoints for the Book resource.
 *
 * Mounted at `/books` in the main application (index.ts).
 * All handlers operate on the in-memory books array from the model.
 *
 * Endpoints:
 *   POST   /books     — Create a new book
 *   GET    /books     — List books (supports filtering, sorting, pagination)
 *   GET    /books/:id — Get a single book by ID
 *   PUT    /books/:id — Update an existing book
 *   DELETE /books/:id — Delete a book
 */

import { Router, Request, Response } from 'express';
import { books, getNextBookId } from '../models/book';
import { authors } from '../models/author';
import { validateBookPayload } from '../middleware/validation';
import {
  CreateBookBody,
  Book,
  BookQueryParams,
  BookSortField,
  Author,
  ApiErrorResponse,
  DeleteResponse,
} from '../types';

const router: Router = Router();

/**
 * List of valid fields that books can be sorted by.
 * Used to guard against sorting by arbitrary/nonexistent properties.
 */
const VALID_SORT_FIELDS: ReadonlyArray<BookSortField> = ['title', 'year', 'id', 'authorId'];

// ─── CREATE ──────────────────────────────────────────────────────────────────

/**
 * POST /books
 * Creates a new book after validation.
 *
 * Business rules:
 * - The title + authorId combination must be unique (case-insensitive title).
 *   A duplicate returns 409 Conflict.
 * - The authorId is validated by the validateBookPayload middleware to
 *   ensure it references an existing author.
 *
 * Request body: { title: string, year?: number, authorId: number }
 * Responses:
 *   201 — Book created successfully (returns the new Book object)
 *   400 — Validation failed (handled by validateBookPayload middleware)
 *   409 — A book with the same title already exists for this author
 */
router.post('/', validateBookPayload, (req: Request, res: Response): void => {
  const { title, year, authorId } = req.body as CreateBookBody;

  // Check for duplicate: same title (case-insensitive) by the same author
  const dup: Book | undefined = books.find(
    (b) => b.title.toLowerCase() === title.trim().toLowerCase() && b.authorId === authorId
  );
  if (dup) {
    res.status(409).json({ error: 'Duplicate book for this author.' } as ApiErrorResponse);
    return;
  }

  // Generate the next unique ID using the model helper
  const id: number = getNextBookId();

  // Create the new book entity and add it to the data store
  const book: Book = { id, title: title.trim(), year, authorId };
  books.push(book);

  // Return 201 Created with the new book object
  res.status(201).json(book);
});

// ─── READ (LIST WITH FILTERS) ───────────────────────────────────────────────

/**
 * GET /books
 * Returns a list of books, supporting optional query-string filters.
 *
 * Supported query parameters (see BookQueryParams interface):
 *   - title  : Filter by title (case-insensitive substring match)
 *   - author : Filter by author name (case-insensitive substring match)
 *   - year   : Filter by exact publication year
 *   - sort   : Sort results, format: "field_direction" (e.g. "year_desc", "title_asc")
 *   - limit  : Maximum number of results per page
 *   - page   : Page number (1-indexed; defaults to 1)
 *
 * Filtering is applied first, then sorting, then pagination.
 *
 * Response: Book[]
 */
router.get('/', (req: Request, res: Response): void => {
  // Start with a shallow copy of all books to avoid mutating the original array
  let results: Book[] = [...books];

  // Extract and type the query parameters
  const { title, author, year, limit, page, sort } = req.query as unknown as BookQueryParams;

  // ── Filter by title (case-insensitive substring match) ──
  if (title && typeof title === 'string') {
    const titleLower: string = title.toLowerCase();
    results = results.filter((b) => b.title.toLowerCase().includes(titleLower));
  }

  // ── Filter by author name (case-insensitive substring match) ──
  if (author && typeof author === 'string') {
    // First find matching author IDs, then filter books by those IDs
    const authorNameLower: string = author.toLowerCase();
    const matchingAuthorIds: number[] = authors
      .filter((a: Author) => a.name.toLowerCase().includes(authorNameLower))
      .map((a: Author) => a.id);
    results = results.filter((b) => matchingAuthorIds.includes(b.authorId));
  }

  // ── Filter by exact publication year ──
  if (year && !isNaN(Number(year))) {
    const yearNum: number = Number(year);
    results = results.filter((b) => b.year === yearNum);
  }

  // ── Sorting (format: "field_direction", e.g. "year_desc") ──
  if (sort && typeof sort === 'string') {
    const [field, dir] = sort.split('_') as [string, string | undefined];

    // Only sort if the field is a valid, sortable Book property
    if (VALID_SORT_FIELDS.includes(field as BookSortField)) {
      const sortField = field as keyof Book;
      const isDescending: boolean = dir === 'desc';

      results.sort((a: Book, b: Book): number => {
        const valA = a[sortField];
        const valB = b[sortField];

        // Handle undefined values (e.g. year is optional) — push them to the end
        if (valA === undefined && valB === undefined) return 0;
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;

        // Compare values with direction awareness
        if (valA < valB) return isDescending ? 1 : -1;
        if (valA > valB) return isDescending ? -1 : 1;
        return 0;
      });
    }
  }

  // ── Pagination (limit + page) ──
  const lim: number | undefined = limit ? Math.max(1, Number(limit)) : undefined;
  const pg: number = page ? Math.max(1, Number(page)) : 1;

  if (lim) {
    // Calculate the start index for the requested page
    const start: number = (pg - 1) * lim;
    results = results.slice(start, start + lim);
  }

  res.json(results);
});

// ─── READ (SINGLE) ──────────────────────────────────────────────────────────

/**
 * GET /books/:id
 * Retrieves a single book by its numeric ID.
 *
 * Responses:
 *   200 — Book found (returns the Book object)
 *   404 — No book exists with the given ID
 */
router.get('/:id', (req: Request, res: Response): void => {
  // Parse the route parameter from string to number
  const id: number = Number(req.params.id);

  // Look up the book in the in-memory store
  const book: Book | undefined = books.find((b) => b.id === id);

  if (!book) {
    res.status(404).json({ error: 'Book not found.' } as ApiErrorResponse);
    return;
  }

  res.json(book);
});

// ─── UPDATE ──────────────────────────────────────────────────────────────────

/**
 * PUT /books/:id
 * Updates an existing book's title, year, and/or authorId.
 *
 * Business rules:
 * - The new title + authorId combination must be unique among OTHER books.
 *   Updating a book to keep its own title + author is allowed.
 *
 * Request body: { title: string, year?: number, authorId: number }
 * Responses:
 *   200 — Book updated successfully (returns the updated Book object)
 *   400 — Validation failed (handled by validateBookPayload middleware)
 *   404 — No book exists with the given ID
 *   409 — Another book with the same title & author already exists
 */
router.put('/:id', validateBookPayload, (req: Request, res: Response): void => {
  const id: number = Number(req.params.id);

  // Find the existing book to update
  const book: Book | undefined = books.find((b) => b.id === id);
  if (!book) {
    res.status(404).json({ error: 'Book not found.' } as ApiErrorResponse);
    return;
  }

  const { title, year, authorId } = req.body as CreateBookBody;

  // Check that no OTHER book has the same title + authorId combination
  const dup: Book | undefined = books.find(
    (b) =>
      b.title.toLowerCase() === title.trim().toLowerCase() &&
      b.authorId === authorId &&
      b.id !== id
  );
  if (dup) {
    res.status(409).json({
      error: 'Another book with same title & author exists.',
    } as ApiErrorResponse);
    return;
  }

  // Apply the updates to the existing book object in-place
  book.title = title.trim();
  book.year = year;
  book.authorId = authorId;

  res.json(book);
});

// ─── DELETE ──────────────────────────────────────────────────────────────────

/**
 * DELETE /books/:id
 * Removes a book from the data store.
 *
 * Unlike author deletion, this does NOT cascade — only the specific
 * book is removed.
 *
 * Responses:
 *   200 — Book deleted (returns { deleted: Book })
 *   404 — No book exists with the given ID
 */
router.delete('/:id', (req: Request, res: Response): void => {
  const id: number = Number(req.params.id);

  // Find the index of the book to remove
  const idx: number = books.findIndex((b) => b.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Book not found.' } as ApiErrorResponse);
    return;
  }

  // Remove the book from the array and capture the removed element
  const removed: Book = books.splice(idx, 1)[0];

  const response: DeleteResponse<Book> = { deleted: removed };
  res.json(response);
});

export default router;
