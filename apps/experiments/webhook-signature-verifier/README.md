# Webhook Signature Verifier

Verify webhook HMAC-SHA256 signatures using timing-safe comparison. Supports Stripe/GitHub `sha256=<hex>` and raw hex formats.

## API

### `POST /verify`

```json
{
  "payload": "{\"id\":1}",
  "secret": "whsec_...",
  "signature": "sha256=...",
  "algorithm": "sha256"
}
```

Returns `match`, `expectedSignature`, `providedSignature`, and an `explanation`.

## Run locally

```bash
cd apps/experiments/webhook-signature-verifier
npm install
npm run dev
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/webhook-signature-verifier)

## Cloudflare features used

- Workers
- Web Crypto API (HMAC-SHA256)
