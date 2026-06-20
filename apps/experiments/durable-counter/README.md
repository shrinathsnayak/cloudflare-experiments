# Durable Counter

Reference implementation for **Durable Objects** - a globally consistent counter with persistent state at the edge.

Use this experiment when you need a single source of truth shared across requests (rate limits, session state, coordination, leader election patterns).

## API

### `GET /counter`

Returns the current counter value.

**Response**

```json
{ "value": 42 }
```

### `POST /counter/increment`

Increments the counter by 1 and returns the new value.

### `POST /counter/reset`

Resets the counter to 0.

## Cloudflare features

- **Durable Objects** - `Counter` class with `DurableObjectState` storage
- **Migrations** - `wrangler.json` registers the `Counter` class

## Run locally

```bash
cd apps/experiments/durable-counter
npm install
npm run dev
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/durable-counter)

After deploy, create the Durable Object namespace if prompted by Wrangler.

## Tests

```bash
npm run test
```
