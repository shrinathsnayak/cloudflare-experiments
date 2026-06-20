# Multi-PoP Latency Map

Fetch a target URL from the edge and report response time plus the Cloudflare colo (`cf.colo`) that served the Worker invocation.

## Important limitation

**Each Worker request runs in exactly one PoP.** This experiment does not perform a true multi-region sweep from a single call. It reports latency from the PoP that handled your request. For geographic comparison, call the endpoint repeatedly from different client locations.

## API

### `GET /latency?url=https://example.com`

Returns `{ url, responseTimeMs, statusCode, colo, city, country, timestamp, limitation, tip }`.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/multi-pop-latency-map)
