# Global Latency Tester

Measure how fast a website responds from the Cloudflare edge. Returns latency and the colo (data center) that handled the request.

## API

### `GET /latency`

Measure from the single edge location that handles the request.

| Query | Required | Description                 |
| ----- | -------- | --------------------------- |
| `url` | Yes      | Website URL (http or https) |

**Example**

```http
GET /latency?url=https://www.cloudflare.com
```

**Response**

```json
{
  "url": "https://www.cloudflare.com",
  "latencyMs": 74,
  "colo": "LHR",
  "statusCode": 200
}
```

### `GET /latency/global`

Check the website from **multiple edge locations** by having the Worker call its own `/latency` endpoint many times in parallel. Each request may be handled by a different colo; results are aggregated by colo.

| Query | Required | Description                 |
| ----- | -------- | --------------------------- |
| `url` | Yes      | Website URL (http or https) |

**Example**

```http
GET /latency/global?url=https://www.cloudflare.com
```

**Response**

```json
{
  "url": "https://www.cloudflare.com",
  "byColo": [
    {
      "colo": "LHR",
      "minLatencyMs": 68,
      "avgLatencyMs": 72,
      "maxLatencyMs": 78,
      "count": 12,
      "statusCode": 200
    },
    {
      "colo": "CDG",
      "minLatencyMs": 81,
      "avgLatencyMs": 85,
      "maxLatencyMs": 92,
      "count": 8,
      "statusCode": 200
    }
  ],
  "sampleCount": 20
}
```

How many colos you see depends on how Cloudflare routes the self-checks. For even broader coverage, call `GET /latency?url=...` from different regions (e.g. via a multi-region testing tool or from different clients).

**Errors** (both endpoints)

- `400` — Missing or invalid `url`.
- `502` — Failed to fetch the URL (or global check failed).

## Run locally

```bash
cd examples/global-latency-tester
npm install
npm run dev
```

Then: `http://localhost:8787/latency?url=https://www.cloudflare.com` or `http://localhost:8787/latency/global?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/global-latency-tester)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Fetch API
- Edge location (cf.colo)
