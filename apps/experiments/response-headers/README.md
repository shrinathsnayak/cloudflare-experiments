# Response Headers

Inspect HTTP response headers for any URL from Cloudflare's edge.

## API

### `GET /headers`

| Query | Required | Description                |
| ----- | -------- | -------------------------- |
| `url` | Yes      | Target URL (http or https) |

**Example**

```http
GET /headers?url=https://www.cloudflare.com
```

**Response**

```json
{
  "url": "https://www.cloudflare.com/",
  "statusCode": 200,
  "statusText": "OK",
  "method": "HEAD",
  "headers": {
    "content-type": "text/html; charset=utf-8",
    "server": "cloudflare"
  }
}
```

Uses `HEAD` first and falls back to `GET` when the origin rejects `HEAD`.

**Errors**

- `400` - Missing or invalid `url`
- `502` - Fetch failed

## Run locally

```bash
cd apps/experiments/response-headers
npm install
npm run dev
```

Then: `http://localhost:8787/headers?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/response-headers)

## Cloudflare features used

- Workers
- Fetch API
