# Tail Logger

Tail Worker that receives traces from another Worker and stores the most recent events in Workers KV.

## Features

- **`tail` handler** — Receives TraceItem batches from producers and keeps the last 50 in KV key `recent`
- **GET /logs** — Read recent events
- **DELETE /logs** — Clear stored events

Each stored event looks like:

```json
{
  "scriptName": "my-worker",
  "outcome": "ok",
  "eventTimestamp": 1710000000000,
  "logs": ["hello from producer"]
}
```

## Configure a producer Worker

In the **producer** Worker's `wrangler.json`, add this Worker as a tail consumer:

```json
{
  "name": "my-producer",
  "tail_consumers": [{ "service": "tail-logger" }]
}
```

Deploy `tail-logger` first, then the producer. When the producer handles requests, its traces are delivered to this Worker's `tail` handler.

## API

### `GET /logs`

```json
{
  "events": [
    {
      "scriptName": "my-producer",
      "outcome": "ok",
      "eventTimestamp": 1710000000000,
      "logs": ["request handled"]
    }
  ],
  "count": 1
}
```

### `DELETE /logs`

```json
{ "cleared": true }
```

## Bindings

```json
"kv_namespaces": [
  { "binding": "TAIL_LOGS", "id": "YOUR_KV_NAMESPACE_ID" }
]
```

## Run locally

```bash
cd apps/experiments/tail-logger
npm install
npm run dev
```

Tail delivery from another Worker typically requires deployed Workers; unit tests call the `tail` export directly with mock events.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/tail-logger)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Tail Workers / `tail_consumers`
- Workers KV
