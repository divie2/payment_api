# Payments API

A payment-processing API built with Node.js, TypeScript, Express and PostgreSQL.
Learning project: sandbox payments only. No real money or customer data.

## Requirements
- Node.js 22+
- Docker (for PostgreSQL)

## Setup
1. Start PostgreSQL in Docker:
   ```bash
   docker run --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
   docker exec -it pg psql -U postgres -c "CREATE DATABASE payments_api;"
   ```
2. Create your `.env` file from the example and fill in your password:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies and create the database tables:
   ```bash
   npm install
   npm run migrate up
   ```
4. Start the server (runs on http://localhost:3000 by default):
   ```bash
   npm run dev
   ```

## Scripts
- `npm run dev` – start the server, restarting on file changes
- `npm run check` – type-check the code with TypeScript
- `npm run migrate up` – apply pending database migrations
- `npm run migrate down` – undo the most recent migration
- `npm run migrate -- create <name> -j sql` – create a new SQL migration file

## Endpoints
All responses are JSON. Errors always have the shape `{ "error": "..." }`, sometimes with a `details` object naming the invalid fields.

### `GET /health`
Checks the database connection.
- `200` – `{"status":"ok","database":"up"}`
- `503` – `{"status":"error","database":"down"}` if the database is unreachable

### `POST /payments`
Creates a payment with status `pending`. Amounts are in kobo (₦1 = 100 kobo).

Request body:
```json
{
  "amountKobo": 250000,
  "customerEmail": "ada@test.com",
  "description": "Optional, up to 200 characters"
}
```
- `amountKobo` – whole number, from 1 to 100,000,000
- `customerEmail` – a valid email address
- `description` – optional

Responses:
- `201` – the created payment
- `400` – invalid body; `details` lists each invalid field

Clients cannot set `status`, `id` or timestamps; extra fields are ignored.

### `GET /payments/:id`
Returns one payment by its UUID.
- `200` – the payment
- `400` – `id` is not a valid UUID
- `404` – no payment with that id

### `GET /payments`
Lists payments, newest first, one page at a time.

Query parameters (all optional):
| Parameter | Default | Rules |
|---|---|---|
| `page` | `1` | whole number, at least 1 |
| `limit` | `20` | whole number, 1–100 |
| `status` | – | `pending`, `success` or `failed` |

Example: `GET /payments?status=success&page=2&limit=10`

Responses:
- `200` – `{ "data": [...payments], "pagination": { "page", "limit", "total", "totalPages" } }`. A page past the end returns an empty `data` array.
- `400` – invalid query parameter; `details` lists which one

### Payment object
```json
{
  "id": "c5a6a8f5-f0fa-4b05-b678-255d7ecea37c",
  "amountKobo": 250000,
  "currency": "NGN",
  "status": "pending",
  "customerEmail": "ada@test.com",
  "description": null,
  "createdAt": "2026-11-08T07:37:20.516Z",
  "updatedAt": "2026-11-08T07:37:20.516Z"
}
```
