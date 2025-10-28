# Library API (TypeScript + Express)

Minimal RESTful API to manage Authors and Books (in-memory storage).

## Features
- CRUD for Authors and Books
- Relationship: Book must reference an existing authorId
- Validation middleware for POST/PUT
- Logger middleware
- Centralized error handling
- Endpoints documented below

## Quick start (local)
1. `npm install`
2. `npm run dev` (requires `ts-node-dev`) or `npm run build && npm start`
3. API runs on http://localhost:3000

## Endpoints
- `POST /authors` — create author `{ name }`
- `GET /authors` — list authors
- `GET /authors/:id` — get author
- `PUT /authors/:id` — update author
- `DELETE /authors/:id` — delete author
- `GET /authors/:id/books` — list books by author

- `POST /books` — create book `{ title, year, authorId }`
- `GET /books` — list books (optional query: title, author, year, limit, page, sort)
- `GET /books/:id` — get book
- `PUT /books/:id` — update book
- `DELETE /books/:id` — delete book

## Notes
- Storage is in-memory arrays (suitable for assessment / learning).
- Duplicate book title by same author returns `409 Conflict`.
