# Radar One Question

Query Cloudflare Radar API for one fact about a domain or ASN.

## Features

- **GET /radar?domain=** - Returns domain ranking information from Cloudflare Radar.
- **GET /radar?asn=** - Returns ASN information (organization, name, country).
- No persistent storage; stateless.
- Runs on the edge in under 60 seconds.

## API

### `GET /radar`

| Query    | Required | Description                           |
| -------- | -------- | ------------------------------------- |
| `domain` | One of   | Domain name (e.g., cloudflare.com)    |
| `asn`    | One of   | ASN number (e.g., 13335 or AS13335)   |

You must provide either `domain` or `asn`, but not both.

**Example (domain)**

```http
GET /radar?domain=cloudflare.com
```

**Response**

```json
{
  "type": "domain",
  "target": "cloudflare.com",
  "fact": "Domain rank in global top domains",
  "ranking": 150
}
```

**Example (ASN)**

```http
GET /radar?asn=13335
```

**Response**

```json
{
  "type": "asn",
  "target": "AS13335",
  "fact": "ASN owned by Cloudflare, Inc. (CLOUDFLARENET) in US"
}
```

**Errors**

- `400` - Missing or invalid parameters.
- `502` - Radar API error or unreachable.

## Run locally

```bash
cd apps/experiments/radar-one-question
npm install
npm run dev
```

Then open: `http://localhost:8787/radar?domain=cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/radar-one-question)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Cloudflare Radar API
- Edge networking
