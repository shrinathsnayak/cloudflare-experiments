# Queue Job Visualizer

Cloudflare Queues producer/consumer demo with KV-backed job status. Jobs simulate resize/fetch tasks with a configurable failure rate and automatic retries via `message.retry()`.

## Features

- **POST /jobs** — Enqueue `{ "type": "resize"|"fetch", "target": "..." }`
- **GET /jobs/:id** — Poll status (`queued` → `processing` → `done`/`failed`)
- Consumer simulates ~35% failure rate; retries up to 3 attempts

## Run locally

```bash
cd apps/experiments/queue-job-visualizer
npm install
npm run dev
```

```bash
curl -X POST http://localhost:8787/jobs \
  -H "Content-Type: application/json" \
  -d '{"type":"fetch","target":"https://example.com"}'
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/queue-job-visualizer)

Create a KV namespace and bind as `JOBS` before deploying.

## Cloudflare features used

- Queues (producer + consumer)
- Workers KV
