# D1 SQL Playground

Read-only SQL playground backed by a seeded Cloudflare D1 database. Run safe `SELECT` queries against sample `products` and `experiments` tables and get JSON rows plus column metadata.

## Features

- **POST /query** — Body `{ "sql": "SELECT * FROM products LIMIT 10" }`; returns rows, column metadata, row count, and query duration.
- **GET /** — App info and list of queryable tables.
- Read-only guardrails: `SELECT` only, no semicolons or comments, allowed tables whitelist, blocked write/DDL keywords and `UNION`.

## API

### `POST /query`

| Body (JSON) | Required | Description                                                   |
| ----------- | -------- | ------------------------------------------------------------- |
| `sql`       | Yes      | Single read-only `SELECT` against `products` or `experiments` |

**Example**

```http
POST /query
Content-Type: application/json

{ "sql": "SELECT name, price FROM products WHERE in_stock = 1 ORDER BY price DESC LIMIT 5" }
```

**Response**

```json
{
  "columns": [
    { "name": "name", "type": "text" },
    { "name": "price", "type": "number" }
  ],
  "rows": [
    { "name": "Browser Rendering Frame", "price": 59.99 },
    { "name": "Workers AI Prompt Pack", "price": 49.99 }
  ],
  "rowCount": 2,
  "durationMs": 3
}
```

**Errors**

- `400` — Invalid JSON (`INVALID_BODY`) or disallowed SQL (`INVALID_SQL`)
- `502` — D1 execution error (`QUERY_ERROR`)

### Seeded tables

| Table         | Description                                    |
| ------------- | ---------------------------------------------- |
| `products`    | Sample product catalog (name, category, price) |
| `experiments` | Subset of experiments from this repo           |

Example queries:

```sql
SELECT category, COUNT(*) AS total FROM products GROUP BY category
SELECT slug, name FROM experiments WHERE category = 'Storage & Data'
SELECT p.name, e.name FROM products p JOIN experiments e ON p.category LIKE '%' || e.category || '%' LIMIT 5
```

## Setup (D1)

1. Create a D1 database and copy its id:

   ```bash
   cd apps/experiments/d1-sql-playground
   npm install
   npm run db:create
   ```

2. Put the returned `database_id` in `wrangler.json` under `d1_databases[0].database_id` (replace the placeholder `00000000-0000-0000-0000-000000000000`).

3. Apply migrations:
   - Local: `npm run db:migrate:local`
   - Remote: `npm run db:migrate`

## Run locally

```bash
npm run db:migrate:local
npm run dev
```

Then:

```bash
curl -X POST http://localhost:8787/query \
  -H "Content-Type: application/json" \
  -d '{"sql":"SELECT * FROM products LIMIT 3"}'
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/d1-sql-playground)

1. Deploy the Worker (use the button or `npm run deploy`).
2. Create the D1 database in the dashboard if not already created, then run `npm run db:migrate` to apply migrations.

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- D1 (SQLite at the edge, seeded read-only playground)
