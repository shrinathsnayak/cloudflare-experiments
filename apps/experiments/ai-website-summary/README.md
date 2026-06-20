# AI Website Summary

Summarize the content of any webpage using **Workers AI**.

## API

### `GET /summary`

| Query | Required | Description                 |
| ----- | -------- | --------------------------- |
| `url` | Yes      | Webpage URL (http or https) |

**Example**

```http
GET /summary?url=https://www.cloudflare.com
```

**Response**

```json
{
  "title": "Example Domain",
  "summary": "This webpage explains..."
}
```

**Errors**

- `400` — Missing or invalid `url`.
- `502` — Failed to fetch the page or AI error.

## Run locally

```bash
cd experiments/ai-website-summary
npm install
npm run dev
```

Then: `http://localhost:8787/summary?url=https://www.cloudflare.com`

Requires a Cloudflare account with Workers AI enabled.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/ai-website-summary)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Workers AI
- Fetch API
