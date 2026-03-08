# Screenshot API

Capture screenshots of any website from the edge using **Cloudflare Browser Rendering**.

## API

### `GET /screenshot`

| Query | Required | Description                 |
| ----- | -------- | --------------------------- |
| `url` | Yes      | Website URL (http or https) |

**Example**

```http
GET /screenshot?url=https://www.cloudflare.com
```

**Response**

- Success: PNG image (`Content-Type: image/png`).
- Error: JSON `{ "error": "...", "code": "..." }`.

**Errors**

- `400` — Missing or invalid `url`.
- `502` — Navigation or screenshot failed (timeout, unreachable, etc.).

## Run locally

```bash
cd experiments/screenshot-api
npm install
npm run dev
```

For local development with a real browser, use: `npx wrangler dev --remote` (see [Cloudflare Browser Rendering docs](https://developers.cloudflare.com/browser-rendering/)).

Then: `http://localhost:8787/screenshot?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/screenshot-api)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

Requires a Cloudflare account with Browser Rendering enabled.

## Cloudflare features used

- Workers
- Browser Rendering (Puppeteer)
- Fetch (via browser navigation)
