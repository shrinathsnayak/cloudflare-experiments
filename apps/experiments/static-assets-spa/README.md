# Static Assets SPA

Demonstrates **Workers Static Assets** with an `ASSETS` binding and `run_worker_first` so API routes hit the Worker while the SPA is served from static files.

## Features

- **Static SPA** from `./public` with SPA `not_found_handling`
- **`run_worker_first: ["/api/*"]`** — API paths invoke the Worker before assets
- **GET /api/hello** — JSON hello from the Worker
- **GET /api/info** — App metadata including whether `ASSETS` is bound
- **ASSETS fallback** — Non-API requests can proxy to `env.ASSETS.fetch` when the Worker handles them

## API

### `GET /api/hello`

```json
{
  "message": "Hello from the Worker",
  "servedBy": "worker"
}
```

### `GET /api/info`

```json
{
  "name": "static-assets-spa",
  "description": "Workers Static Assets SPA with ASSETS binding and run_worker_first for API routes",
  "assetsBinding": true
}
```

### `GET /`

In tests (no assets runtime), returns JSON app info. In production with Static Assets, `/` is typically served as `public/index.html` because only `/api/*` uses `run_worker_first`.

## Bindings

```json
"assets": {
  "directory": "./public",
  "binding": "ASSETS",
  "not_found_handling": "single-page-application",
  "run_worker_first": ["/api/*"]
}
```

## Run locally

```bash
cd apps/experiments/static-assets-spa
npm install
npm run dev
```

Open the local URL to load the SPA; it fetches `/api/hello` from the Worker.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/static-assets-spa)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Workers Static Assets (`ASSETS` binding)
- `run_worker_first` for API routes
- SPA `not_found_handling`
