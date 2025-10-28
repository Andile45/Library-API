import { Request, Response, NextFunction } from 'express';
import { authors } from '../models/author';

export function validateAuthorPayload(req: Request, res: Response, next: NextFunction) {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Author validation failed: "name" is required (non-empty string).' });
  }
  next();
}

export function validateBookPayload(req: Request, res: Response, next: NextFunction) {
  const { title, authorId, year } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Book validation failed: "title" is required (non-empty string).' });
  }
  if (authorId === undefined || typeof authorId !== 'number') {
    return res.status(400).json({ error: 'Book validation failed: "authorId" is required (number).' });
  }
  const authorExists = authors.some(a => a.id === authorId);
  if (!authorExists) {
    return res.status(400).json({ error: 'Book validation failed: referenced authorId does not exist.' });
  }
  if (year !== undefined && typeof year !== 'number') {
    return res.status(400).json({ error: 'Book validation failed: "year" must be a number if provided.' });
  }
  next();
}
