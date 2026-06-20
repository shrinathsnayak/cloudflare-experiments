# Turnstile Verify

Verify [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) tokens server-side using the siteverify API.

This experiment calls `https://challenges.cloudflare.com/turnstile/v0/siteverify` directly — there is no Turnstile Worker binding.

## Features

- **POST /verify** — Validate a client Turnstile token and return the siteverify result.
- Uses the `TURNSTILE_SECRET_KEY` environment secret.

## Setup

Set your Turnstile secret key as a Worker secret:

```bash
cd apps/experiments/turnstile-verify
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Use the **secret key** from your Turnstile widget configuration in the Cloudflare dashboard.

## API

### `POST /verify`

| Field   | Required | Description              |
| ------- | -------- | ------------------------ |
| `token` | Yes      | Turnstile response token |

**Example**

```http
POST /verify
Content-Type: application/json

{
  "token": "0.abc123..."
}
```

**Response**

```json
{
  "success": true,
  "hostname": "example.com",
  "action": "login"
}
```

On failure, `success` is `false` and `errorCodes` may be present:

```json
{
  "success": false,
  "errorCodes": ["invalid-input-response"]
}
```

**Errors**

- `400` — Missing or invalid `token`, or invalid JSON body
- `502` — Secret not configured (`MISSING_SECRET`) or siteverify request failed

## Run locally

```bash
cd apps/experiments/turnstile-verify
npm install
npx wrangler secret put TURNSTILE_SECRET_KEY
npm run dev
```

Then verify a token from your Turnstile widget:

```bash
curl -X POST http://localhost:8787/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TURNSTILE_TOKEN"}'
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/turnstile-verify)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

After deploy, set the secret on your Worker:

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY
```

## Cloudflare features used

- Workers
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) (siteverify API)
