# Broken Link Checker

Extract links from a webpage and report HTTP status codes from Cloudflare's edge.

## Features

- **GET /check?url=** - Fetches HTML, extracts `a[href]` links, probes up to 25 (max 50) with HEAD/GET.
- Concurrent probes (5 at a time) with per-link timeouts.
- Stateless; no bindings.

## API

### `GET /check`

| Query   | Required | Description                             |
| ------- | -------- | --------------------------------------- |
| `url`   | Yes      | Target page URL (http or https)         |
| `limit` | No       | Max links to probe (default 25, max 50) |

**Example**

```http
GET /check?url=https://www.cloudflare.com&limit=10
```

**Response**

```json
{
  "url": "https://www.cloudflare.com/",
  "checked": 10,
  "broken": 1,
  "links": [
    { "href": "https://www.cloudflare.com/", "statusCode": 200, "ok": true },
    { "href": "https://www.cloudflare.com/missing", "statusCode": 404, "ok": false }
  ]
}
```

**Errors**

- `400` `INVALID_URL` - Missing or invalid `url`
- `400` `NOT_HTML` - Response was not HTML
- `502` `FETCH_ERROR` - Page fetch failed

## Run locally

```bash
cd apps/experiments/broken-link-checker
npm install
npm run dev
```

Then open: `http://localhost:8787/check?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/broken-link-checker)

## Cloudflare features used

- Workers
- Fetch API
- Edge networking
