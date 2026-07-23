# Robots Sitemap Inspector

Parse `robots.txt` and linked sitemaps for any URL from Cloudflare's edge. Useful for SEO and AI-crawler debugging.

## Features

- **GET /inspect?url=** - Fetches `/robots.txt`, parses user-agent rules and Sitemap directives, then inspects up to 5 sitemaps.
- Reports sitemap type (`urlset` vs `sitemapindex`), URL counts, and sample URLs.
- Stateless; no bindings.

## API

### `GET /inspect`

| Query | Required | Description                |
| ----- | -------- | -------------------------- |
| `url` | Yes      | Target URL (http or https) |

**Example**

```http
GET /inspect?url=https://www.cloudflare.com
```

**Response**

```json
{
  "url": "https://www.cloudflare.com/",
  "robots": {
    "present": true,
    "url": "https://www.cloudflare.com/robots.txt",
    "groups": [{ "userAgent": "*", "allow": [], "disallow": ["/cdn-cgi/"] }],
    "sitemaps": ["https://www.cloudflare.com/sitemap.xml"]
  },
  "sitemaps": [
    {
      "url": "https://www.cloudflare.com/sitemap.xml",
      "ok": true,
      "type": "sitemapindex",
      "urlCount": 3,
      "childSitemaps": ["https://www.cloudflare.com/sitemap-0.xml"]
    }
  ]
}
```

**Errors**

- `400` `INVALID_URL` - Missing or invalid `url`
- `502` `FETCH_ERROR` - Unexpected fetch failure

Missing `robots.txt` (404) still returns `200` with `robots.present: false`.

## Run locally

```bash
cd apps/experiments/robots-sitemap-inspector
npm install
npm run dev
```

Then open: `http://localhost:8787/inspect?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/robots-sitemap-inspector)

## Cloudflare features used

- Workers
- Fetch API
- Edge networking
