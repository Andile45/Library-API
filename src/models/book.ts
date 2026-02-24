/**
 * @fileoverview Book model — defines the Book entity and in-memory data store.
 *
 * This module exports:
 *  - The Book interface (re-exported from types for co-location convenience)
 *  - The in-memory `books` array that acts as the data store
 *  - A `getNextBookId` helper that generates the next unique ID
 *
 * Each Book references an Author via the `authorId` foreign key.
 * The relationship is enforced by validation middleware before any
 * create or update operation.
 *
 * Storage is entirely in-memory — data is lost on server restart.
 */

import { Book } from '../types';

// Re-export the Book type so consumers can import from the model file
export type { Book };

/**
 * In-memory data store for Book entities.
 *
 * All CRUD operations in the books router read from and mutate
 * this array directly. Because it lives in module scope, every
 * import of this module shares the same reference.
 */
export const books: Book[] = [];

/**
 * Calculates the next available Book ID.
 *
 * Uses a reduce operation to find the current maximum ID and adds 1.
 * Returns 1 when the array is empty (first book).
 *
 * @returns The next unique integer ID for a new Book
 */
export function getNextBookId(): number {
  return books.reduce((max, b) => Math.max(max, b.id), 0) + 1;
}
