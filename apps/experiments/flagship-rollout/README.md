# Flagship Rollout

Evaluate **Cloudflare Flagship** feature flags at the edge via a Workers binding.

## Setup

1. Create a Flagship app in the Cloudflare dashboard and note the `app_id`.
2. Update `wrangler.json`:

```json
{
  "flagship": [
    {
      "binding": "FLAGS",
      "app_id": "your-app-id"
    }
  ]
}
```

## API

### `GET /flags/:key`

| Param / Query | Required | Description                                      |
| ------------- | -------- | ------------------------------------------------ |
| `key`         | Yes      | Flag key                                         |
| `userId`      | No       | Targeting context attribute                      |
| `default`     | No       | Fallback boolean (`true`/`false`, default false) |

**Response**

```json
{
  "flagKey": "new-checkout",
  "value": true,
  "context": { "userId": "user-42" }
}
```

### `GET /flags/:key/details`

Same query params. Returns evaluation details (`variant`, `reason`, `errorCode`, etc.).

**Errors**

- `400` - `INVALID_FLAG_KEY`
- `502` - `FLAG_ERROR`

## Run locally

```bash
cd apps/experiments/flagship-rollout
npm install
npm run dev
```

Local `wrangler dev` evaluates against the live Flagship app configured by `app_id`.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/flagship-rollout)

## Cloudflare features used

- Flagship
