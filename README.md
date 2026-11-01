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
3. Install dependencies and start the server:
   ```bash
   npm install
   npm run dev
   ```

## Scripts
- `npm run dev` – start the server, restarting on file changes
- `npm run check` – type-check the code with TypeScript

## Endpoints
- `GET /health` – checks the database connection.
  Returns `200 {"status":"ok","database":"up"}`, or `503 {"status":"error","database":"down"}` if the database is unreachable.
