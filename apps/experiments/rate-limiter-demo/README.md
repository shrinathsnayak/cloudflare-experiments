# Rate Limiter Demo

Demonstrates the native Workers Rate Limiting binding. Returns 429 with `Retry-After` when exceeded; tracks demo usage counters in KV.

## API

- **GET /limited** — Rate-limited endpoint (key defaults to client IP, override with `?key=`)
- **GET /status?key=...** — View configured limit and demo usage counters

Configured limit: 10 requests per 60 seconds (see `wrangler.json`).

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/rate-limiter-demo)

Create a KV namespace bound as `USAGE`.

## Cloudflare features used

- Rate Limiting binding
- Workers KV
