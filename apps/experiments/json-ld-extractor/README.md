# JSON-LD Extractor

Extract Schema.org JSON-LD (`application/ld+json`) structured data from any webpage at the edge.

## Features

- **GET /extract?url=** - Returns parsed JSON-LD blocks and discovered `@type` values.
- Handles `@graph` arrays and reports invalid JSON blocks without failing the whole response.
- Stateless; no bindings.

## API

### `GET /extract`

| Query | Required | Description              |
| ----- | -------- | ------------------------ |
| `url` | Yes      | Page URL (http or https) |

**Errors**

- `400` `INVALID_URL` / `NOT_HTML`
- `502` `FETCH_ERROR`

## Run locally

```bash
cd apps/experiments/json-ld-extractor
npm install
npm run dev
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/json-ld-extractor)

## Cloudflare features used

- Workers
- Fetch API
