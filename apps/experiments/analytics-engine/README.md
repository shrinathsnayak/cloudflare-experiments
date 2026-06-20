# Analytics Engine

Write custom events to [Workers Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/) at the edge.

The `experiment_events` dataset is **auto-created on first write** — you do not need to create it manually in the dashboard before sending events.

## Features

- **POST /track** — Record a named event with an optional numeric value and tag.
- Uses the `ANALYTICS` Analytics Engine dataset binding.

## API

### `POST /track`

| Field   | Required | Description                                       |
| ------- | -------- | ------------------------------------------------- |
| `event` | Yes      | Event name (non-empty string, max 100 characters) |
| `value` | No       | Numeric value (defaults to `1`)                   |
| `tag`   | No       | Optional string tag stored as a blob              |

**Example**

```http
POST /track
Content-Type: application/json

{
  "event": "page_view",
  "value": 1,
  "tag": "homepage"
}
```

**Response**

```json
{
  "ok": true,
  "event": "page_view",
  "value": 1
}
```

**Errors**

- `400` — Missing or invalid `event`, or invalid JSON body

## Run locally

```bash
cd apps/experiments/analytics-engine
npm install
npm run dev
```

Then send a test event:

```bash
curl -X POST http://localhost:8787/track \
  -H "Content-Type: application/json" \
  -d '{"event":"demo_click","value":1,"tag":"local"}'
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/analytics-engine)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- [Workers Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/)
