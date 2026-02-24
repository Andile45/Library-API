/**
 * @fileoverview Centralized TypeScript type definitions for the Library API.
 *
 * This module contains all shared interfaces and types used across the
 * application, including request/response shapes, query parameter types,
 * and API error structures. Centralizing types improves maintainability
 * and ensures consistency across route handlers and middleware.
 */

// ─── Author Types ────────────────────────────────────────────────────────────

/**
 * Represents an Author entity stored in-memory.
 * Each author has a unique numeric ID assigned at creation time.
 */
export interface Author {
    /** Unique auto-incremented identifier */
    id: number;
    /** Full name of the author (trimmed, case-insensitive uniqueness enforced) */
    name: string;
    /** Optional short biography */
    bio?: string;
}

/**
 * Shape of the request body when creating or updating an Author.
 * Sent via POST /authors or PUT /authors/:id.
 */
export interface CreateAuthorBody {
    /** Author name — required, must be a non-empty string */
    name: string;
    /** Optional biography text */
    bio?: string;
}

// ─── Book Types ──────────────────────────────────────────────────────────────

/**
 * Represents a Book entity stored in-memory.
 * Each book is linked to an Author via authorId (foreign-key relationship).
 */
export interface Book {
    /** Unique auto-incremented identifier */
    id: number;
    /** Title of the book (trimmed, unique per author — case-insensitive) */
    title: string;
    /** Optional publication year */
    year?: number;
    /** References the owning Author's id — must exist in the authors array */
    authorId: number;
}

/**
 * Shape of the request body when creating or updating a Book.
 * Sent via POST /books or PUT /books/:id.
 */
export interface CreateBookBody {
    /** Book title — required, must be a non-empty string */
    title: string;
    /** Optional publication year (must be a number if provided) */
    year?: number;
    /** ID of the author this book belongs to — must reference an existing author */
    authorId: number;
}

// ─── Query & Pagination Types ────────────────────────────────────────────────

/**
 * Supported query parameters for GET /books.
 * All fields are optional and arrive as strings from Express query parsing.
 */
export interface BookQueryParams {
    /** Filter by book title (case-insensitive substring match) */
    title?: string;
    /** Filter by author name (case-insensitive substring match) */
    author?: string;
    /** Filter by exact publication year */
    year?: string;
    /** Maximum number of results per page (defaults to all) */
    limit?: string;
    /** Page number for pagination (1-indexed, defaults to 1) */
    page?: string;
    /** Sort field and direction, e.g. "year_desc" or "title_asc" */
    sort?: string;
}

/**
 * Sortable fields on the Book entity.
 * Used to validate the sort query parameter.
 */
export type BookSortField = 'title' | 'year' | 'id' | 'authorId';

// ─── API Response Types ──────────────────────────────────────────────────────

/**
 * Standard error response shape returned by the API.
 */
export interface ApiErrorResponse {
    /** Human-readable error description */
    error: string;
}

/**
 * Response shape when a resource is successfully deleted.
 * Returns the deleted entity wrapped in a `deleted` key.
 */
export interface DeleteResponse<T> {
    /** The entity that was deleted */
    deleted: T;
}

/**
 * Health-check response returned by GET /.
 */
export interface HealthCheckResponse {
    /** Always "ok" when the server is running */
    status: string;
    /** Unix timestamp in milliseconds */
    timestamp: number;
}
