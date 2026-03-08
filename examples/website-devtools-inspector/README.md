# Inspect Any Website Like DevTools (From the Edge)

A DevTools-style inspector that returns headers, cookies, scripts, assets, metadata, and dependencies for any URL.

## API

### `GET /devtools`

| Query | Required | Description                 |
| ----- | -------- | --------------------------- |
| `url` | Yes      | Website URL (http or https) |

**Example**

```http
GET /devtools?url=https://www.cloudflare.com
```

**Response**

```json
{
  "url": "https://www.cloudflare.com",
  "statusCode": 200,
  "responseTimeMs": 85,
  "headers": {},
  "cookies": [],
  "metadata": { "title": "...", "description": "...", "canonical": "..." },
  "scripts": [],
  "stylesheets": [],
  "images": [],
  "links": []
}
```

**Errors**

- `400` — Missing or invalid `url`.
- `502` — Failed to fetch the page.

## Run locally

```bash
cd examples/website-devtools-inspector
npm install
npm run dev
```

Then: `http://localhost:8787/devtools?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/website-devtools-inspector)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Fetch API
- HTML parsing and network inspection
