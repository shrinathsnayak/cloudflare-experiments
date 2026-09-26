# R2 SQL Query

Query **Apache Iceberg** tables managed by [R2 Data Catalog](https://developers.cloudflare.com/r2/data-catalog/) using the [R2 SQL HTTP API](https://developers.cloudflare.com/r2-sql/query-data/). There is no Workers binding — this experiment uses secrets and `fetch`.

Without credentials, endpoints return sample rows with `mode: "demo"`.

## Setup

1. Enable R2 Data Catalog on an R2 bucket (warehouse) and create Iceberg tables (e.g. via Pipelines).
2. Create an API token with **R2 SQL Read**, **R2 Data Catalog Read**, and **R2 Storage Read**.
3. Set secrets and vars:

```bash
npx wrangler secret put CLOUDFLARE_ACCOUNT_ID
npx wrangler secret put R2_SQL_AUTH_TOKEN
```

```json
{
  "vars": {
    "WAREHOUSE": "your-bucket-or-warehouse-name"
  }
}
```

`WAREHOUSE` (or `R2_BUCKET_NAME`) defaults to `demo-warehouse` and can be overridden per request.

## API

### `GET /`

Returns app name, description, and usage.

### `GET /query?q=` / `GET /query?query=`

| Param       | Required | Description                        |
| ----------- | -------- | ---------------------------------- |
| `q`/`query` | Yes      | SQL statement (`SELECT` or `SHOW`) |
| `warehouse` | No       | Override warehouse / bucket name   |

### `POST /query`

```json
{
  "query": "SELECT * FROM default.ecommerce LIMIT 10",
  "warehouse": "optional-override"
}
```

**Response (demo)**

```json
{
  "mode": "demo",
  "query": "SELECT * FROM default.ecommerce LIMIT 10",
  "warehouse": "demo-warehouse",
  "rows": [{ "event_type": "purchase", "user_id": "user_123", "...": "..." }],
  "note": "Configure CLOUDFLARE_ACCOUNT_ID and R2_SQL_AUTH_TOKEN for live R2 SQL queries"
}
```

**Response (live)**

```json
{
  "mode": "live",
  "query": "SELECT * FROM default.ecommerce LIMIT 10",
  "warehouse": "my-warehouse",
  "rows": [],
  "raw": {}
}
```

**Errors**

- `400` `INVALID_QUERY` — Missing, empty, or oversized query
- `400` `FORBIDDEN_SQL` — Non-`SELECT`/`SHOW` (e.g. `INSERT`, `UPDATE`, `DELETE`, `DROP`)
- `502` `QUERY_ERROR` — Upstream R2 SQL API failure

Only `SELECT` and `SHOW` statements are allowed (max 4000 characters).

## Run locally

```bash
cd apps/experiments/r2-sql-query
npm install
npm run dev
```

Without secrets, `GET /query?q=SELECT+1` returns demo rows.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/r2-sql-query)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- R2 SQL
- R2 Data Catalog / Apache Iceberg
