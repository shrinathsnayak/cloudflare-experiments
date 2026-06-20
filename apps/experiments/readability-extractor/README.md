# Readability Extractor

Extract article-style readable content from any webpage using **Cloudflare Browser Rendering** and readability-style heuristics.

Unlike raw text extraction, this focuses on main content: title, optional author metadata, body text, word count, and estimated read time.

## API

### `GET /extract`

| Query | Required | Description                 |
| ----- | -------- | --------------------------- |
| `url` | Yes      | Website URL (http or https) |

**Example**

```http
GET /extract?url=https://blog.cloudflare.com
```

**Response**

```json
{
  "url": "https://blog.cloudflare.com/",
  "title": "Example post title",
  "author": "Jane Doe",
  "body": "Main article text without navigation and sidebars ...",
  "wordCount": 842,
  "readTimeMinutes": 5
}
```

**Errors**

- `400` - Missing or invalid `url`.
- `502` - Navigation or extraction failed.

## Run locally

```bash
cd apps/experiments/readability-extractor
npm install
npm run dev
```

Use `npm run dev` (runs `wrangler dev --remote`). Then:

`http://localhost:8787/extract?url=https://blog.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/readability-extractor)

Requires a Cloudflare account with Browser Rendering enabled.

## Cloudflare features used

- Workers
- Browser Rendering (Puppeteer navigation + DOM heuristics)
