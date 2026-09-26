# Secrets Store Demo

Read an account-scoped secret from [Cloudflare Secrets Store](https://developers.cloudflare.com/secrets-store/) without ever returning the full value.

## Features

- **GET /secret/status** — Whether the secret is configured, its length, and a 2-character preview
- **GET /secret/verify?expected=** — Compare without logging or returning the secret (`match: boolean`)

## API

### `GET /secret/status`

**Configured**

```json
{ "configured": true, "length": 12, "preview": "ab***" }
```

**Missing / error**

```json
{ "configured": false }
```

### `GET /secret/verify?expected=`

```json
{ "match": true }
```

**Errors**

- `400` `MISSING_PARAM` — `expected` query param missing or empty

## Dashboard setup

1. Create a Secrets Store and a secret named `demo-api-key`.
2. Update `store_id` in `wrangler.json`:

```json
"secrets_store_secrets": [
  {
    "binding": "API_KEY",
    "store_id": "YOUR-STORE-UUID",
    "secret_name": "demo-api-key"
  }
]
```

## Run locally

```bash
cd apps/experiments/secrets-store-demo
npm install
npm run dev
```

Secrets Store bindings may require a remote/dev account; use tests with a mocked `API_KEY.get` for local verification.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/secrets-store-demo)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Secrets Store
