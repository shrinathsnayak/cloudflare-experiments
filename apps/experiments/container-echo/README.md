# Container Echo

Echo a message via **Cloudflare Containers**. A Durable Object subclass (`EchoContainer`) extends `@cloudflare/containers`'s `Container` and proxies requests to a Node HTTP server running in the container image.

## API

### `POST /echo`

Send `text/plain` or JSON (`{ "message": "..." }`).

**Response**

```json
{ "echo": "hello", "port": 8080 }
```

## Cloudflare features

- **Containers** — Dockerfile-backed image on port 8080
- **Durable Objects** — `EchoContainer` manages lifecycle via `@cloudflare/containers`

## Run locally

Docker must be running for `wrangler dev` / deploy (container image build).

```bash
cd apps/experiments/container-echo
npm install
npm run dev
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/container-echo)

## Tests

```bash
npm run test
```

Unit tests mock the Durable Object binding so Docker is not required.
