# CORS Preflight Tester

Send an OPTIONS preflight request and report which CORS response headers are present, missing, or misconfigured.

## API

### `POST /test`

```json
{
  "url": "https://api.example.com/resource",
  "origin": "https://app.example.com",
  "method": "POST",
  "headers": ["Authorization", "Content-Type"]
}
```

Returns per-header checks for `Access-Control-Allow-Origin`, `Allow-Methods`, `Allow-Headers`, and related CORS headers.

## Run locally

```bash
cd apps/experiments/cors-preflight-tester
npm install
npm run dev
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/cors-preflight-tester)

## Cloudflare features used

- Workers
- Fetch API
