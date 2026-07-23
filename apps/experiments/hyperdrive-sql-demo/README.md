# Hyperdrive SQL Demo

Query an existing PostgreSQL database through **Cloudflare Hyperdrive** connection pooling from a Worker.

## Features

- **GET /status** - Shows redacted Hyperdrive target (host/db/user)
- **GET /ping** - Runs `SELECT current_database(), current_user, version()`
- **POST /query** - Runs a single read-only `SELECT` (max 50 rows)
- Uses `postgres` (Postgres.js) with `nodejs_compat`

## Setup

1. Create a Hyperdrive config:

```bash
npx wrangler hyperdrive create hyperdrive-sql-demo \
  --connection-string="postgres://USER:PASSWORD@HOST:5432/DATABASE"
```

2. Paste the returned `id` into [`wrangler.json`](wrangler.json) under `hyperdrive[0].id`.

3. For local dev, set `localConnectionString` to a reachable Postgres URL (already stubbed).

## API

### `POST /query`

```bash
curl -X POST http://localhost:8787/query \
  -H 'content-type: application/json' \
  -d '{"sql":"SELECT 1 AS ok"}'
```

**Errors**

- `400` `INVALID_BODY` / `INVALID_SQL`
- `502` `MISSING_BINDING` / `DB_ERROR`

## Run locally

```bash
cd apps/experiments/hyperdrive-sql-demo
npm install
npm run dev
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/hyperdrive-sql-demo)

## Cloudflare features used

- Workers
- Hyperdrive
- Node.js compatibility (`nodejs_compat`)
