# AI Batch Infer

Submit a batch of Workers AI embedding inferences with `queueRequest: true`, then poll by `request_id` via the Asynchronous Batch API.

## Setup

Workers AI binding and model are declared in `wrangler.json`:

```json
{
  "ai": { "binding": "AI" },
  "vars": { "MODEL": "@cf/baai/bge-m3" }
}
```

Override `MODEL` if you prefer another batch-capable embedding model (e.g. `@cf/baai/bge-small-en-v1.5`). Without an AI binding (local/demo), routes return demo queued/poll responses.

## API

### `POST /batch`

**Body**

```json
{
  "texts": ["first phrase", "second phrase"]
}
```

| Field   | Required | Description                                 |
| ------- | -------- | ------------------------------------------- |
| `texts` | Yes      | 1–20 non-empty strings, max 2000 chars each |

**Response (queued)**

```json
{
  "status": "queued",
  "model": "@cf/baai/bge-m3",
  "request_id": "000-000-000",
  "mode": "live"
}
```

### `GET /batch/:requestId`

Poll batch status/results for a previously queued `request_id`.

While processing, the API may return `status: "queued"` or `"running"`. When complete, the response includes per-item results.

**Errors**

- `400` - `INVALID_BODY`, `INVALID_REQUEST_ID`
- `502` - `BATCH_ERROR`

## Run locally

```bash
cd apps/experiments/ai-batch-infer
npm install
npm run dev
```

Workers AI batch typically needs remote AI / account access (`wrangler` with your Cloudflare account).

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ai-batch-infer)

## Cloudflare features used

- Workers AI
- Asynchronous Batch API (`queueRequest`)
