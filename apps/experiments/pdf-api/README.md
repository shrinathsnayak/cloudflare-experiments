# PDF API

Generate PDF documents from any webpage using **Cloudflare Browser Rendering**.

## API

### `GET /pdf`

| Query | Required | Description                 |
| ----- | -------- | --------------------------- |
| `url` | Yes      | Website URL (http or https) |

**Example**

```http
GET /pdf?url=https://www.cloudflare.com
```

**Response**

- Success: PDF file (`Content-Type: application/pdf`).
- Error: JSON `{ "error": "...", "code": "..." }`.

**Errors**

- `400` - Missing or invalid `url`.
- `502` - PDF generation failed (timeout, unreachable, etc.).

## Run locally

```bash
cd apps/experiments/pdf-api
npm install
npm run dev
```

Use `npm run dev` (runs `wrangler dev --remote`) so Browser Rendering is available. Then:

`http://localhost:8787/pdf?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/pdf-api)

Requires a Cloudflare account with Browser Rendering enabled.

## Cloudflare features used

- Workers
- Browser Rendering (Puppeteer `page.pdf()`)
- Fetch (via browser navigation)
