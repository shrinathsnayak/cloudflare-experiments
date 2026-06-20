# AI Website Tag Generator

Generate topic tags for any website using **Workers AI**.

## API

### `GET /tags`

| Query | Required | Description                                                          |
| ----- | -------- | -------------------------------------------------------------------- |
| `url` | Yes      | Webpage URL or host (e.g. `https://cloudflare.com` or `example.com`) |

**Example**

```http
GET /tags?url=example.com
```

**Response**

```json
{
  "tags": ["technology", "startup", "documentation"]
}
```

**Errors**

- `400` — Missing or invalid `url`.
- `502` — Failed to fetch the page or AI error.

## Run locally

```bash
cd experiments/ai-website-tag-generator
npm install
npm run dev
```

Then: `http://localhost:8787/tags?url=https://cloudflare.com`

Requires a Cloudflare account with Workers AI enabled.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/ai-website-tag-generator)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Workers AI
- Fetch API
