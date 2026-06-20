# DO Alarm Scheduler

Schedule a one-off reminder N seconds in the future using the Durable Object Alarm API (`setAlarm`). Poll status to confirm when the alarm fired.

## API

- **POST /schedule** — `{ "seconds": 30, "message": "Check the deploy" }` → `{ id, status: "scheduled", ... }`
- **GET /status/:id** — Returns `scheduled` or `fired` with timestamps

Seconds must be between 1 and 300.

## Run locally

```bash
cd apps/experiments/do-alarm-scheduler
npm install
npm run dev
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/do-alarm-scheduler)

## Cloudflare features used

- Durable Objects
- Alarm API
