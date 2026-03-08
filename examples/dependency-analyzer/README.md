# Webpage Dependency Analyzer

Analyze all external resources loaded by a webpage: scripts, stylesheets, fonts, images, and iframes.

## API

### `GET /analyze`

| Query | Required | Description                 |
| ----- | -------- | --------------------------- |
| `url` | Yes      | Webpage URL (http or https) |

**Example**

```http
GET /analyze?url=https://www.cloudflare.com
```

**Response**

```json
{
  "scripts": ["https://www.cloudflare.com/app.js"],
  "stylesheets": ["https://www.cloudflare.com/style.css"],
  "images": ["https://www.cloudflare.com/logo.png"],
  "fonts": [],
  "iframes": []
}
```

**Errors**

- `400` — Missing or invalid `url`.
- `502` — Failed to fetch the page.

## Run locally

```bash
cd examples/dependency-analyzer
npm install
npm run dev
```

Then: `http://localhost:8787/analyze?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/dependency-analyzer)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Fetch API
- HTML parsing (regex-based)
