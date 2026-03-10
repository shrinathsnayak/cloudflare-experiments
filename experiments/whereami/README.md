# Where Am I?

Return request metadata from Cloudflare's edge (geolocation, colo, etc.) using the incoming request's `cf` object. No bindings; stateless.

## Features

- **GET /** — Returns name, description, and usage (same as other experiments).
- **GET /whereami** — Returns the `cf` object (country, city, colo, timezone, etc.) from the incoming request.
- No persistent storage; no external fetch.

## API

### `GET /whereami`

No query parameters. The response includes whatever Cloudflare injects into `request.cf` for the incoming request (e.g. `country`, `city`, `region`, `timezone`, `colo`, `asn`).

**Example**

```http
GET /whereami
```

**Response (example when deployed)**

```json
{
  "country": "US",
  "city": "San Francisco",
  "region": "California",
  "timezone": "America/Los_Angeles",
  "colo": "SFO",
  "asn": 13335
}
```

Locally, `cf` may be empty or minimal; full data appears when deployed to Cloudflare.

## Run locally

```bash
cd experiments/whereami
npm install
npm run dev
```

Then open: `http://localhost:8787/whereami` (or `http://localhost:8787/` for name/usage info)

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/whereami)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Incoming request `cf` (geolocation / edge metadata)
