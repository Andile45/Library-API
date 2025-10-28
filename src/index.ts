import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authorsRouter from './routes/authors';
import booksRouter from './routes/books';
import { logger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(logger);

app.use('/authors', authorsRouter);
app.use('/books', booksRouter);

// Health
app.get('/', (req, res) => res.json({ status: 'ok', timestamp: Date.now() }));

// Central error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Library API listening on http://localhost:${PORT}`);
});
