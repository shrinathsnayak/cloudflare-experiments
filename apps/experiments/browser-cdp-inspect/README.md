# Browser CDP Inspect

Browser Rendering inspection beyond screenshots — navigate with **@cloudflare/puppeteer** and return title, cookies, document metadata, and performance timing.

## API

### `GET /inspect?url=`

| Param | Required | Description                    |
| ----- | -------- | ------------------------------ |
| `url` | Yes      | `http://` or `https://` target |

**Response**

```json
{
  "title": "Example Domain",
  "url": "https://example.com/",
  "cookiesCount": 0,
  "documentTitle": "Example Domain",
  "performance": { "domContentLoaded": 120.5 },
  "userAgent": "..."
}
```

Navigation timeout: 20s. Uses `waitUntil: "domcontentloaded"` to stay under the Worker request budget.

**Errors**

- `400` / `INVALID_URL` — missing or non-http(s) url
- `502` / `INSPECT_ERROR` — browser launch or navigation failure

## Run locally

```bash
cd apps/experiments/browser-cdp-inspect
npm install
npm run dev
```

Browser Rendering requires remote mode (`wrangler dev --remote`) or a deployed Worker.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/browser-cdp-inspect)

## Cloudflare features used

- Workers
- Browser Rendering (`browser` binding)
- `@cloudflare/puppeteer`
