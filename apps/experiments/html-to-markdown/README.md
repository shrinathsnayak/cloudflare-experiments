# HTML to Markdown

Convert any webpage’s HTML into clean Markdown at the edge. Fetches the URL, prefers `<article>` / `<main>` content when present, and returns title + Markdown JSON.

## API

### `GET /markdown`

| Query | Required | Description                 |
| ----- | -------- | --------------------------- |
| `url` | Yes      | Webpage URL (http or https) |

**Example**

```http
GET /markdown?url=https://www.cloudflare.com
```

**Success response**

```json
{
  "url": "https://www.cloudflare.com/",
  "title": "Cloudflare - The Web Performance & Security Company",
  "markdown": "# …\n\n…"
}
```

**Errors**

- `400` - Missing or invalid `url` (`INVALID_URL`)
- `400` - Response was not HTML (`NOT_HTML`)
- `502` - Failed to fetch the page (`FETCH_ERROR`)

## Run locally

```bash
cd apps/experiments/html-to-markdown
npm install
npm run dev
```

Then: `http://localhost:8787/markdown?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/html-to-markdown)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Fetch API
