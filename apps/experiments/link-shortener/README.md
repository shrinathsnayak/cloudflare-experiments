# Link Shortener

Minimal URL shortener using Cloudflare D1 (primary) and KV (read cache). Shorten a URL via POST and redirect via GET.

## Features

- **POST /shorten** — Body `{ "url": "https://..." }`; returns `{ code, url }`. Stores in D1 and populates KV cache.
- **GET /:code** — Redirects to the stored URL (302). Reads from KV first; on cache miss, reads from D1 and caches the result. Returns 404 if not found.
- No analytics or expiry; single table (code, url, created_at). D1 is source of truth; KV is a read-through cache.

## API

### `POST /shorten`

| Body (JSON) | Required | Description           |
| ----------- | -------- | --------------------- |
| `url`       | Yes      | Long URL (http/https) |

**Example**

```http
POST /shorten
Content-Type: application/json

{ "url": "https://www.cloudflare.com" }
```

**Response**

```json
{ "code": "a1B2c3", "url": "https://www.cloudflare.com" }
```

Redirect: `GET /a1B2c3` → 302 to the URL.

**Errors**

- `400` — Missing/invalid JSON or invalid `url` (non-http(s)).

### `GET /:code`

Redirects to the stored URL. Returns `404` with `{ error, code: "NOT_FOUND" }` if the code does not exist.

## Setup (D1 + KV)

1. Create a D1 database and get its id:

   ```bash
   cd experiments/link-shortener
   npm install
   npx wrangler d1 create link-shortener-db
   ```

2. Put the returned `database_id` in `wrangler.json` under `d1_databases[0].database_id` (replace the placeholder `00000000-0000-0000-0000-000000000000`).

3. Create a KV namespace for the read cache:

   ```bash
   npx wrangler kv namespace create LINKS_CACHE
   ```

   Put the returned `id` in `wrangler.json` under `kv_namespaces[0].id` (replace the placeholder `00000000000000000000000000000000`). For local dev you can use the same id or create a preview namespace with `npx wrangler kv namespace create LINKS_CACHE --preview` and set `preview_id` in that entry.

4. Apply migrations:
   - Local: `npm run db:migrate:local`
   - Remote: `npm run db:migrate`

## Run locally

```bash
npm run db:migrate:local
npm run dev
```

Then:

```bash
curl -X POST http://localhost:8787/shorten -H "Content-Type: application/json" -d '{"url":"https://cloudflare.com"}'
curl -I http://localhost:8787/<code>
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/link-shortener)

1. Deploy the Worker (use the button or `npm run deploy`).
2. Create the D1 database in the dashboard if not already created, then run `npm run db:migrate` to apply migrations.

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- D1 (SQLite at the edge, primary store)
- KV (read-through cache for redirects)
