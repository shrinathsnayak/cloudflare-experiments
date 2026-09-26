# Browser Markdown Scrape

Convert a URL to Markdown and scrape CSS selectors using Cloudflare Browser Rendering **quickAction** (REST-style binding — not Puppeteer).

## API

### `GET /`

Returns app name, description, and usage hints.

### `GET /markdown?url=`

| Param | Required | Description                    |
| ----- | -------- | ------------------------------ |
| `url` | Yes      | `http://` or `https://` target |

**Response**

```json
{
  "url": "https://example.com/",
  "markdown": "# Example Domain\n\n..."
}
```

**Errors**

- `400` / `INVALID_URL` — missing or non-http(s) url
- `502` / `MARKDOWN_ERROR` — quickAction failure

### `GET /scrape?url=&selector=`

| Param      | Required | Description                        |
| ---------- | -------- | ---------------------------------- |
| `url`      | Yes      | `http://` or `https://` target     |
| `selector` | Yes      | CSS selector (sent as one element) |

**Response**

```json
{
  "url": "https://example.com/",
  "results": [
    {
      "selector": "h1",
      "results": [
        {
          "text": "Example Domain",
          "html": "Example Domain",
          "attributes": [],
          "height": 39,
          "width": 600,
          "top": 133.4,
          "left": 100
        }
      ]
    }
  ]
}
```

**Errors**

- `400` / `INVALID_URL` — missing or non-http(s) url
- `400` / `MISSING_SELECTOR` — selector missing or empty
- `502` / `SCRAPE_ERROR` — quickAction failure

## Run locally

```bash
cd apps/experiments/browser-markdown-scrape
npm install
npm run dev -- --remote
```

`quickAction` requires remote mode (`wrangler dev --remote`) or a deployed Worker.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/browser-markdown-scrape)

## Cloudflare features used

- Workers
- Browser Rendering (`browser` binding + `quickAction`)
