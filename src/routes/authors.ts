import { Router } from 'express';
import { authors } from '../models/author';
import { books } from '../models/book';
import { validateAuthorPayload } from '../middleware/validation';

const router = Router();

// Create author
router.post('/', validateAuthorPayload, (req, res) => {
  const { name, bio } = req.body;
  const duplicate = authors.find(a => a.name.toLowerCase() === name.trim().toLowerCase());
  if (duplicate) return res.status(409).json({ error: 'Author already exists.' });
  const id = authors.length > 0 ? Math.max(...authors.map(a => a.id)) + 1 : 1;
  const author = { id, name: name.trim(), bio };
  authors.push(author);
  res.status(201).json(author);
});

// List authors
router.get('/', (req, res) => {
  res.json(authors);
});

// Get author by id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const author = authors.find(a => a.id === id);
  if (!author) return res.status(404).json({ error: 'Author not found.' });
  res.json(author);
});

// Update author
router.put('/:id', validateAuthorPayload, (req, res) => {
  const id = Number(req.params.id);
  const author = authors.find(a => a.id === id);
  if (!author) return res.status(404).json({ error: 'Author not found.' });
  const { name, bio } = req.body;
  // check duplicate name on other authors
  const dup = authors.find(a => a.name.toLowerCase() === name.trim().toLowerCase() && a.id !== id);
  if (dup) return res.status(409).json({ error: 'Another author with the same name exists.' });
  author.name = name.trim();
  author.bio = bio;
  res.json(author);
});

// Delete author
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = authors.findIndex(a => a.id === id);
  if (index === -1) return res.status(404).json({ error: 'Author not found.' });
  // Also remove books by this author
  for (let i = books.length - 1; i >= 0; i--) {
    if (books[i].authorId === id) books.splice(i, 1);
  }
  const removed = authors.splice(index, 1)[0];
  res.json({ deleted: removed });
});

// List books by author
router.get('/:id/books', (req, res) => {
  const id = Number(req.params.id);
  const author = authors.find(a => a.id === id);
  if (!author) return res.status(404).json({ error: 'Author not found.' });
  const authorBooks = books.filter(b => b.authorId === id);
  res.json(authorBooks);
});

export default router;
