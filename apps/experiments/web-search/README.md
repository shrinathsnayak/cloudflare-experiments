# Web Search

Query the Cloudflare Web Search API through AI Gateway.

## Features

- **POST /search** - Search the web via ceramic, exa, or linkup providers through AI Gateway.
- Returns up to the specified limit of results (default 5).
- No persistent storage; stateless.
- Runs on the edge in under 60 seconds.

## API

### `POST /search`

**Request body**

```json
{
  "query": "cloudflare workers",
  "provider": "ceramic",
  "limit": 5
}
```

| Field      | Required | Description                                       |
| ---------- | -------- | ------------------------------------------------- |
| `query`    | Yes      | Search query string                               |
| `provider` | No       | Search provider: ceramic, exa, or linkup (default: ceramic) |
| `limit`    | No       | Maximum results to return (default: 5)            |

**Example**

```http
POST /search
Content-Type: application/json

{
  "query": "cloudflare workers edge computing",
  "provider": "ceramic",
  "limit": 5
}
```

**Response**

```json
{
  "query": "cloudflare workers edge computing",
  "provider": "ceramic",
  "limit": 5,
  "results": [
    {
      "url": "https://workers.cloudflare.com",
      "title": "Cloudflare Workers",
      "snippet": "..."
    }
  ]
}
```

**Errors**

- `400` - Invalid JSON, missing query, or invalid provider.
- `502` - Web Search API error.

## Configuration

Set environment variables in `wrangler.json` or via the dashboard:

```json
{
  "vars": {
    "AI_GATEWAY_ACCOUNT_ID": "your-account-id",
    "AI_GATEWAY_ID": "your-gateway-id"
  }
}
```

If not set, defaults to demo values.

## Run locally

```bash
cd apps/experiments/web-search
npm install
npm run dev
```

Then POST to: `http://localhost:8787/search`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/web-search)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Web Search API (Oct 2026 beta)
- AI Gateway
