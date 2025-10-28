import { Router } from 'express';
import { books } from '../models/book';
import { authors } from '../models/author';
import { validateBookPayload } from '../middleware/validation';

const router = Router();

// Create book
router.post('/', validateBookPayload, (req, res) => {
  const { title, year, authorId } = req.body;
  // duplicate check: same title + author
  const dup = books.find(b => b.title.toLowerCase() === title.trim().toLowerCase() && b.authorId === authorId);
  if (dup) return res.status(409).json({ error: 'Duplicate book for this author.' });
  const id = books.reduce((max, b) => Math.max(max, b.id), 0) + 1;
  const book = { id, title: title.trim(), year, authorId };
  books.push(book);
  res.status(201).json(book);
});

// Listing books with optional query filters: title, author, year, pagination
router.get('/', (req, res) => {
  let results = [...books];
  const { title, author, year, limit, page, sort } = req.query;

  if (title && typeof title === 'string') {
    results = results.filter(b => b.title.toLowerCase().includes(title.toLowerCase()));
  }
  if (author && typeof author === 'string') {
    // match author name
    const authorName = author.toLowerCase();
    const matchingAuthorIds = authors.filter(a => a.name.toLowerCase().includes(authorName)).map(a => a.id);
    results = results.filter(b => matchingAuthorIds.includes(b.authorId));
  }
  if (year && !isNaN(Number(year))) {
    results = results.filter(b => b.year === Number(year));
  }
  // sorting (e.g., sort=year_desc or title_asc)
  if (sort && typeof sort === 'string') {
    const [field, dir] = sort.split('_');
    results.sort((a: any, b: any) => {
      if (a[field] < b[field]) return dir === 'desc' ? 1 : -1;
      if (a[field] > b[field]) return dir === 'desc' ? -1 : 1;
      return 0;
    });
  }
  // pagination
  const lim = limit ? Math.max(1, Number(limit)) : undefined;
  const pg = page ? Math.max(1, Number(page)) : 1;
  if (lim) {
    const start = (pg - 1) * lim;
    results = results.slice(start, start + lim);
  }
  res.json(results);
});

// Get book
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const book = books.find(b => b.id === id);
  if (!book) return res.status(404).json({ error: 'Book not found.' });
  res.json(book);
});

// Update book
router.put('/:id', validateBookPayload, (req, res) => {
  const id = Number(req.params.id);
  const book = books.find(b => b.id === id);
  if (!book) return res.status(404).json({ error: 'Book not found.' });
  const { title, year, authorId } = req.body;
  // duplicate check
  const dup = books.find(b => b.title.toLowerCase() === title.trim().toLowerCase() && b.authorId === authorId && b.id !== id);
  if (dup) return res.status(409).json({ error: 'Another book with same title & author exists.' });
  book.title = title.trim();
  book.year = year;
  book.authorId = authorId;
  res.json(book);
});

// Delete book
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Book not found.' });
  const removed = books.splice(idx, 1)[0];
  res.json({ deleted: removed });
});

export default router;
