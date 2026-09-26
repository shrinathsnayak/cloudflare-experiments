# Smart Placement Probe

Demonstrate **Workers Smart Placement** by fetching an origin URL and reporting latency alongside the request colo.

`wrangler.json` sets `"placement": { "mode": "smart" }` so Cloudflare can place the Worker closer to back-end origins based on traffic patterns.

## API

### `GET /`

Explains Smart Placement and returns app metadata.

### `GET /probe?url=`

| Param | Required | Description                    |
| ----- | -------- | ------------------------------ |
| `url` | Yes      | `http://` or `https://` target |

**Response**

```json
{
  "url": "https://example.com/",
  "status": 200,
  "latencyMs": 42,
  "cf": { "colo": "SJC" },
  "workerPlacement": "Smart Placement may move this Worker closer to back-end origins based on request patterns."
}
```

`cf.colo` comes from the incoming `request.cf` when available (empty object in local dev).

## Run locally

```bash
cd apps/experiments/smart-placement-probe
npm install
npm run dev
```

Smart Placement behavior is most visible after deploy with repeated requests to distant origins.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/smart-placement-probe)

## Cloudflare features used

- Workers
- Smart Placement
