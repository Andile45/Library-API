/**
 * @fileoverview Author model — defines the Author entity and in-memory data store.
 *
 * This module exports:
 *  - The Author interface (re-exported from types for co-location convenience)
 *  - The in-memory `authors` array that acts as the data store
 *  - A `getNextAuthorId` helper that generates the next unique ID
 *
 * Storage is entirely in-memory, meaning all data is lost when the
 * server restarts. This is intentional for a learning / assessment project.
 */

import { Author } from '../types';

// Re-export the Author type so consumers can import from the model file
export type { Author };

/**
 * In-memory data store for Author entities.
 *
 * All CRUD operations in the authors router read from and mutate
 * this array directly. Because it lives in module scope, every
 * import of this module shares the same reference.
 */
export const authors: Author[] = [];

/**
 * Calculates the next available Author ID.
 *
 * IDs are auto-incremented by finding the current maximum ID in the
 * array and adding 1. If the array is empty, the first ID is 1.
 *
 * @returns The next unique integer ID for a new Author
 */
export function getNextAuthorId(): number {
  if (authors.length === 0) return 1;
  return Math.max(...authors.map((a) => a.id)) + 1;
}
