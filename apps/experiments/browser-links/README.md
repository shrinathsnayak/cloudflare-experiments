# Browser Links

Extract links from JavaScript-rendered pages using **Cloudflare Browser Rendering**.

## API

### `GET /links`

| Query | Required | Description                 |
| ----- | -------- | --------------------------- |
| `url` | Yes      | Website URL (http or https) |

**Example**

```http
GET /links?url=https://www.cloudflare.com
```

**Response**

```json
{
  "url": "https://www.cloudflare.com/",
  "linkCount": 42,
  "truncated": false,
  "links": [{ "href": "https://www.cloudflare.com/plans/", "text": "Plans" }]
}
```

Returns up to 500 unique links with deduplicated `href` values.

**Errors**

- `400` - Missing or invalid `url`
- `502` - Navigation or extraction failed

## Run locally

```bash
cd apps/experiments/browser-links
npm install
npm run dev
```

Use `npm run dev` (`wrangler dev --remote`) for Browser Rendering.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/browser-links)

Requires Browser Rendering enabled on your account.

## Cloudflare features used

- Workers
- Browser Rendering (Puppeteer DOM evaluation)
