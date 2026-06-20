# Workflows Pipeline Demo

Durable three-step pipeline using Cloudflare Workflows: fetch a URL, summarize it with Workers AI, and store the result in R2. Uses `step.do()` for each step and `step.sleep()` to demonstrate pause/resume.

## Features

- **POST /run** — Start a workflow instance with `{ "url": "https://..." }`
- **GET /status/:instanceId** — Poll workflow status and result
- Steps: fetch page → sleep 3s → AI summarize → store JSON in R2

## API

### `POST /run`

Returns `{ instanceId, status }` with HTTP 202.

### `GET /status/:instanceId`

Returns `{ instanceId, status, output, error }`. When complete, `output` includes `{ url, summary, r2Key }`.

## Setup

1. Create R2 bucket `workflows-pipeline-summaries` (or update `wrangler.json`).
2. Enable Workers AI on your account.
3. Deploy with `npm run deploy`.

## Run locally

```bash
cd apps/experiments/workflows-pipeline-demo
npm install
npm run dev
```

```bash
curl -X POST http://localhost:8787/run \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/workflows-pipeline-demo)

## Cloudflare features used

- Workflows (`WorkflowEntrypoint`, `step.do`, `step.sleep`)
- Workers AI
- R2
