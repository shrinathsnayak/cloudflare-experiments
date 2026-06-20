# Rendered Text

Extract JavaScript-rendered visible text from any webpage using **Cloudflare Browser Rendering**.

Unlike fetch-and-parse experiments, this loads the page in a headless browser so client-side rendered content is included.

## API

### `GET /text`

| Query | Required | Description                 |
| ----- | -------- | --------------------------- |
| `url` | Yes      | Website URL (http or https) |

**Example**

```http
GET /text?url=https://www.cloudflare.com
```

**Response**

```json
{
  "url": "https://www.cloudflare.com/",
  "title": "Connect, protect, and build everywhere",
  "text": "Connect, protect, and build everywhere ...",
  "textLength": 1234,
  "truncated": false
}
```

Text is normalized (whitespace collapsed) and capped at 50,000 characters.

**Errors**

- `400` - Missing or invalid `url`.
- `502` - Navigation or extraction failed.

## Run locally

```bash
cd apps/experiments/rendered-text
npm install
npm run dev
```

Use `npm run dev` (runs `wrangler dev --remote`). Then:

`http://localhost:8787/text?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/rendered-text)

Requires a Cloudflare account with Browser Rendering enabled.

## Cloudflare features used

- Workers
- Browser Rendering (Puppeteer navigation + DOM evaluation)
