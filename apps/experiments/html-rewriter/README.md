# HTML Rewriter

Extract HTML statistics and transform pages with **HTMLRewriter** at the edge.

## Features

- **GET /stats?url=** - Count links, images, headings, and read the page title via HTMLRewriter handlers.
- **GET /transform?url=&banner=** - Inject a banner `<div>` at the top of `<body>`.
- No bindings; stateless streaming HTML transformation.

## API

### `GET /stats`

| Query | Required | Description        |
| ----- | -------- | ------------------ |
| `url` | Yes      | http or https only |

**Example response**

```json
{
  "url": "https://example.com",
  "title": "Example Domain",
  "linkCount": 1,
  "imageCount": 0,
  "headingCounts": { "h1": 1 }
}
```

### `GET /transform`

| Query    | Required | Description                    |
| -------- | -------- | ------------------------------ |
| `url`    | Yes      | http or https only             |
| `banner` | No       | Banner text (default provided) |

**Example response**

```json
{
  "url": "https://example.com",
  "banner": "Transformed by Cloudflare HTMLRewriter at the edge",
  "html": "<html>...</html>"
}
```

## Run locally

```bash
cd apps/experiments/html-rewriter
npm install
npm run dev
```

Then open: `http://localhost:8787/stats?url=https://example.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/html-rewriter)

## Cloudflare features used

- Workers
- HTMLRewriter
