# Event Pipeline

Ingest events into [Cloudflare Pipelines](https://developers.cloudflare.com/pipelines/) for streaming to R2/Iceberg. When the Pipelines binding is unavailable (local demo), events append as JSON Lines to an R2 bucket.

## Features

- **POST /events** — Send one or many JSON event objects to the pipeline (or R2 fallback).
- **GET /events/sample** — Example event schema and accepted body shapes.
- **PIPELINE** binding for Cloudflare Pipelines; **EVENTS** R2 bucket for fallback.

## API

### `POST /events`

Accepts any of:

- A single event object
- An array of event objects (max 100)
- `{ "events": [ ... ] }`

**Example**

```http
POST /events
Content-Type: application/json

{
  "events": [
    {
      "type": "page_view",
      "timestamp": "2026-01-15T12:00:00.000Z",
      "userId": "user_123",
      "properties": { "path": "/home" }
    }
  ]
}
```

**Response**

```json
{
  "ok": true,
  "count": 1,
  "transport": "pipeline"
}
```

`transport` is `"pipeline"` when `PIPELINE` is bound, otherwise `"r2"` (appends to `events/YYYY-MM-DD.jsonl`).

**Errors**

- `400` `INVALID_BODY` — Invalid JSON, non-object events, or empty batch
- `400` `TOO_MANY_EVENTS` — More than 100 events
- `502` `PIPELINE_ERROR` — Pipeline or R2 write failed

### `GET /events/sample`

Returns an example event schema and accepted request shapes.

## Dashboard setup

1. Create a Pipeline named `events-pipeline` in the Cloudflare dashboard (Pipelines → Create).
2. Create an R2 bucket `event-pipeline-events` for the local/fallback path.
3. Update `wrangler.json` if your pipeline or bucket names differ:

```json
"pipelines": [{ "binding": "PIPELINE", "pipeline": "events-pipeline" }],
"r2_buckets": [{ "binding": "EVENTS", "bucket_name": "event-pipeline-events" }]
```

## Run locally

```bash
cd apps/experiments/event-pipeline
npm install
npm run dev
```

Without a Pipelines binding, `wrangler dev` uses the R2 fallback when `EVENTS` is available.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/event-pipeline)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Cloudflare Pipelines
- R2 (fallback JSONL storage)
