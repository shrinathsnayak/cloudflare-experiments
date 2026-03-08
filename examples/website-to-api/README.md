# Turn Any Website Into an API

Convert webpage content into structured JSON: title, headings, links, and images.

## API

### `GET /api`

| Query | Required | Description                 |
| ----- | -------- | --------------------------- |
| `url` | Yes      | Webpage URL (http or https) |

**Example**

```http
GET /api?url=https://www.cloudflare.com
```

**Response**

```json
{
  "title": "Example Domain",
  "headings": [{ "level": 1, "text": "Example Heading" }],
  "links": ["https://www.cloudflare.com/page"],
  "images": ["https://www.cloudflare.com/image.png"]
}
```

**Errors**

- `400` — Missing or invalid `url`.
- `502` — Failed to fetch the page.

## Run locally

```bash
cd examples/website-to-api
npm install
npm run dev
```

Then: `http://localhost:8787/api?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/website-to-api)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Fetch API
- HTML parsing (regex-based)
