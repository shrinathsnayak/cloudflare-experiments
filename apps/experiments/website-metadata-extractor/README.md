# Website Metadata Extractor

Extract metadata from any webpage: title, description, Open Graph tags, and canonical URL.

## API

### `GET /metadata`

| Query | Required | Description                 |
| ----- | -------- | --------------------------- |
| `url` | Yes      | Webpage URL (http or https) |

**Example**

```http
GET /metadata?url=https://www.cloudflare.com
```

**Response**

```json
{
  "title": "Example Domain",
  "description": "Example description",
  "canonical": "https://www.cloudflare.com/",
  "og": {
    "title": "Example",
    "description": "...",
    "image": "https://www.cloudflare.com/og.png",
    "type": "website",
    "url": "https://www.cloudflare.com"
  }
}
```

**Errors**

- `400` — Missing or invalid `url`.
- `502` — Failed to fetch or parse the page.

## Run locally

```bash
cd experiments/website-metadata-extractor
npm install
npm run dev
```

Then: `http://localhost:8787/metadata?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/website-metadata-extractor)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Fetch API
- HTML parsing (regex-based, no DOM)
