# AI Gateway Dashboard

Generate text with **Workers AI** routed through **AI Gateway**, including cache metadata and optional latency comparison.

## API

### `POST /generate`

| Field          | Required | Description                                                  |
| -------------- | -------- | ------------------------------------------------------------ |
| `prompt`       | Yes      | Prompt sent to the model (max 4,000 characters)              |
| `compareCache` | No       | When `true`, runs cached vs `skipCache` and compares latency |

**Example**

```http
POST /generate
Content-Type: application/json

{
  "prompt": "Explain AI Gateway caching in one sentence.",
  "compareCache": true
}
```

**Response**

```json
{
  "response": "…model text…",
  "gateway": {
    "id": "default",
    "model": "@cf/meta/llama-3.1-8b-instruct-fast",
    "latencyMs": 842,
    "cacheStatus": "MISS",
    "skipCache": false
  },
  "cacheComparison": {
    "cached": {
      "latencyMs": 842,
      "cacheStatus": "MISS",
      "skipCache": false
    },
    "skipCache": {
      "latencyMs": 1190,
      "cacheStatus": "BYPASS",
      "skipCache": true
    },
    "latencyDeltaMs": 348
  }
}
```

`cacheComparison` is included only when `compareCache` is `true`. Cache status comes from AI Gateway (`cf-aig-cache-status`) when available, or `BYPASS` when `skipCache` is used.

**Errors**

- `400` - Invalid JSON or prompt
- `502` - AI Gateway / Workers AI request failed

## Run locally

```bash
cd apps/experiments/ai-gateway-dashboard
npm install
npm run dev
```

Enable AI Gateway caching in your Cloudflare dashboard for meaningful cache hit/miss results.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ai-gateway-dashboard)

## Cloudflare features used

- Workers
- Workers AI
- AI Gateway
