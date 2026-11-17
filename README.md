# Payments API

A payment-processing API built with Node.js, TypeScript, NestJS and PostgreSQL.
Learning project: sandbox payments only. No real money or customer data.

The first version was built with Express. It is kept at the git tag `express-v1`.

## Requirements
- Node.js 22+
- Docker (for PostgreSQL)

## Setup
1. Start PostgreSQL in Docker:
   ```bash
   docker run --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
   docker exec -it pg psql -U postgres -c "CREATE DATABASE payments_api;"
   ```
   Later, after a restart, `docker start pg` is enough.
2. Create your `.env` file from the example and fill in your password:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies and create the database tables:
   ```bash
   npm install
   npm run migrate up
   ```
4. Start the server (runs on http://localhost:4000 with the example `.env`):
   ```bash
   npm run start:dev
   ```

The app checks its configuration at startup: if `DATABASE_URL` is missing, it stops with an error instead of starting.

## Scripts
- `npm run start:dev` – start the server, restarting on file changes
- `npm run build` – compile TypeScript into `dist/`
- `npm run start:prod` – run the compiled app from `dist/`
- `npm run migrate up` – apply pending database migrations
- `npm run migrate down` – undo the most recent migration
- `npm run migrate -- create <name> -j sql` – create a new SQL migration file

## Errors
All responses are JSON. Errors use NestJS's standard shape:
```json
{ "message": "Payment not found", "error": "Not Found", "statusCode": 404 }
```
For validation errors, `message` is a list with one entry per problem:
```json
{
  "message": ["amountKobo must be an integer number", "customerEmail must be an email"],
  "error": "Bad Request",
  "statusCode": 400
}
```
This differs from the Express version (`express-v1`), which returned `{ "error": "..." }`. Clients of the old version need to update.

## Endpoints

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
- `description` – optional, text up to 200 characters

Responses:
- `201` – the created payment
- `400` – invalid body; `message` lists each problem

Clients cannot set `status`, `id` or timestamps; extra fields are removed.

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
- `400` – invalid query parameter; `message` lists each problem

### `GET /payments/summary`
Returns totals across all payments: the number of payments, the count per status, and the total and average amount of successful payments (in kobo, average rounded to a whole number).

```json
{
  "totalCount": 62,
  "byStatus": { "pending": 20, "success": 25, "failed": 17 },
  "successAmountKobo": 13421744,
  "averageAmountKobo": 536870
}
```

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
