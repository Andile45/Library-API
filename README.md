# Library API (TypeScript + Express)

A minimal RESTful API to manage **Authors** and **Books** using in-memory storage, built with TypeScript and Express.

## Features

- Full **CRUD** operations for Authors and Books
- **One-to-many relationship**: each Book references an existing Author via `authorId`
- **Input validation** middleware for POST and PUT requests
- **Duplicate detection** (case-insensitive) for both authors and books
- **Cascade delete**: removing an author also removes all their books
- **Filtering, sorting & pagination** on the books listing endpoint
- **Request logging** middleware (timestamp + method + URL)
- **Centralized error handling** with a custom `AppError` class
- **Comprehensive TypeScript types** — explicit interfaces for all entities, request payloads, and API responses

## Project Structure

```
src/
├── index.ts               # Express app setup and server startup
├── types/
│   └── index.ts           # Centralized TypeScript interfaces and types
├── models/
│   ├── author.ts          # Author entity, in-memory store, ID generator
│   └── book.ts            # Book entity, in-memory store, ID generator
├── middleware/
│   ├── logger.ts          # Request logging middleware
│   ├── errorHandler.ts    # Global error-handling middleware
│   └── validation.ts      # Body validation for authors and books
├── routes/
│   ├── authors.ts         # CRUD + nested routes for /authors
│   └── books.ts           # CRUD + query routes for /books
└── utils/
    └── errors.ts          # Custom AppError class
```

## Quick Start

### Prerequisites

- **Node.js** v16+ and **npm** v8+

### Installation

```bash
npm install
```

### Development (hot-reload)

```bash
npm run dev
```

The API will be available at **http://localhost:3000**.

### Production

```bash
npm run build
npm start
```

### Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT`   | `3000`  | Port the server listens on |

## API Endpoints

### Authors

| Method   | Endpoint              | Description                         |
|----------|-----------------------|-------------------------------------|
| `POST`   | `/authors`            | Create a new author `{ name, bio? }` |
| `GET`    | `/authors`            | List all authors                    |
| `GET`    | `/authors/:id`        | Get a single author by ID           |
| `PUT`    | `/authors/:id`        | Update an author `{ name, bio? }`    |
| `DELETE` | `/authors/:id`        | Delete an author (cascades to books) |
| `GET`    | `/authors/:id/books`  | List all books by an author         |

### Books

| Method   | Endpoint     | Description                                      |
|----------|--------------|--------------------------------------------------|
| `POST`   | `/books`     | Create a new book `{ title, year?, authorId }`   |
| `GET`    | `/books`     | List books (with optional filters — see below)   |
| `GET`    | `/books/:id` | Get a single book by ID                          |
| `PUT`    | `/books/:id` | Update a book `{ title, year?, authorId }`       |
| `DELETE` | `/books/:id` | Delete a book                                    |

### Book Query Parameters

| Parameter | Type     | Description                                        |
|-----------|----------|----------------------------------------------------|
| `title`   | `string` | Filter by title (case-insensitive substring match) |
| `author`  | `string` | Filter by author name (case-insensitive substring) |
| `year`    | `number` | Filter by exact publication year                   |
| `sort`    | `string` | Sort by field + direction (e.g. `year_desc`, `title_asc`) |
| `limit`   | `number` | Max results per page                               |
| `page`    | `number` | Page number (1-indexed, default 1)                 |

## Error Handling

All errors follow a consistent JSON format:

```json
{
  "error": "Human-readable error description"
}
```

| Status Code | Meaning                          |
|-------------|----------------------------------|
| `400`       | Validation failed                |
| `404`       | Resource not found               |
| `409`       | Duplicate / conflict             |
| `500`       | Internal server error            |

## Design Decisions

- **In-memory storage**: Data lives in JavaScript arrays — simple, no database setup required, but data is lost on restart. Suitable for learning and assessment.
- **Cascade deletion**: Deleting an author removes all associated books to prevent orphaned references.
- **Centralized types**: All TypeScript interfaces are defined in `src/types/index.ts` for consistency and maintainability.
- **Custom AppError class**: Enables route handlers to throw structured errors with HTTP status codes, handled cleanly by the error middleware.

## Scripts

| Script          | Command                       | Description                     |
|-----------------|-------------------------------|---------------------------------|
| `npm run dev`   | `ts-node-dev --respawn ...`   | Start dev server with hot-reload |
| `npm run build` | `tsc`                         | Compile TypeScript to `dist/`   |
| `npm start`     | `node dist/index.js`          | Run the compiled production build |

## Tech Stack

| Technology      | Version  | Purpose                      |
|-----------------|----------|------------------------------|
| TypeScript      | ^5.2.2   | Static type safety           |
| Express         | ^4.18.2  | HTTP framework               |
| body-parser     | ^1.20.2  | JSON request body parsing    |
| cors            | ^2.8.5   | Cross-Origin Resource Sharing |
| ts-node-dev     | ^2.0.0   | Development server with hot-reload |
