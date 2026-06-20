# Edge Cache

Fetch URLs through the Workers Cache API at the edge.

## Features

- **GET /fetch?url=** - Fetches a URL and reports whether the response came from cache (`HIT`), origin (`MISS`), or bypassed cache (`BYPASS`).
- Optional **`bypass=1`** to skip cache lookup and storage.
- No persistent bindings; uses `caches.default`.

## API

### `GET /fetch`

| Query    | Required | Description                                    |
| -------- | -------- | ---------------------------------------------- |
| `url`    | Yes      | Target URL (http or https)                     |
| `bypass` | No       | Set to `1`, `true`, or `yes` to skip the cache |

**Example**

```http
GET /fetch?url=https://www.cloudflare.com
```

**Response**

```json
{
  "url": "https://www.cloudflare.com/",
  "cacheStatus": "MISS",
  "statusCode": 200,
  "contentType": "text/html",
  "bodySize": 125678
}
```

**Errors**

- `400` - Missing or invalid `url`
- `502` - Upstream fetch failed

## Run locally

```bash
cd apps/experiments/edge-cache
npm install
npm run dev
```

Then open: `http://localhost:8787/fetch?url=https://www.cloudflare.com`

Call the same URL twice to observe `cacheStatus: "HIT"` on the second request.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/edge-cache)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Cache API (`caches.default`)
- Fetch API
