# Cron Heartbeat

Reference implementation for **Cron Triggers** - scheduled tasks that run on a cron schedule and persist metadata in **Workers KV**.

Use this experiment when you need periodic background work (health checks, cache warming, cleanup jobs, report generation).

## API

### `GET /status`

Returns metadata from the most recent scheduled run.

**Response**

```json
{
  "lastRun": "2025-06-20T12:00:00.000Z",
  "lastCron": "*/5 * * * *",
  "runCount": 12
}
```

## Scheduled handler

The worker runs every 5 minutes (`*/5 * * * *`) and records:

- `lastRun` - ISO timestamp
- `lastCron` - cron expression that fired
- `runCount` - total runs since deploy

## Cloudflare features

- **Cron Triggers** - `scheduled()` handler in `src/index.ts`
- **Workers KV** - persists run metadata across invocations

## Run locally

```bash
cd apps/experiments/cron-heartbeat
npm install
npm run dev
```

Trigger a cron manually in dev:

```bash
curl "http://localhost:8787/cdn-cgi/handler/scheduled"
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/cron-heartbeat)

Create a KV namespace and update `wrangler.json` with the real namespace ID.

## Tests

```bash
npm run test
```
