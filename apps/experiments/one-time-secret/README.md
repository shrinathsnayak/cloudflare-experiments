# One-Time Secret

Share a password or token via a self-destructing link. The Worker encrypts the secret with a fresh AES-256-GCM key (Web Crypto), stores **only the ciphertext and IV** in a per-secret Durable Object, and returns the key to you. The key travels in the URL fragment (`#key`), which browsers never send to the server.

## API

- **POST /secrets** — `{ "secret": "...", "ttlSeconds": 3600 }` → `201 { id, key, url, expiresAt }`
  - `secret`: 1–10,000 chars. `ttlSeconds`: integer 60–604800 (default 86400).
- **GET /secrets/:id** — `{ id, exists, expiresAt }` without revealing anything
- **POST /secrets/:id/reveal** — `{ "key": "<base64url>" }` → `{ secret }`, then the secret is deleted
- **GET /s/:id** — Small HTML page that reads the key from `location.hash` and reveals on button click

Errors: `400` (`INVALID_BODY`, `INVALID_SECRET`, `INVALID_TTL`, `INVALID_ID`, `INVALID_KEY`), `404` (`NOT_FOUND`).

## How it stays one-time

- Decryption runs **inside the Durable Object**; storage is deleted only after a successful decrypt, so a wrong key (`INVALID_KEY`) does not burn the secret.
- `reveal()` runs under `blockConcurrencyWhile`, so two simultaneous reveals cannot both succeed.
- A Durable Object alarm deletes the secret at `expiresAt`; reads also treat past-expiry records as gone.
- `GET /s/:id` never reveals by itself, so link-preview bots (Slack, iMessage, etc.) don't consume the secret.

## Run locally

```bash
cd apps/experiments/one-time-secret
npm install
npm run dev
curl -X POST http://localhost:8787/secrets -H "Content-Type: application/json" -d '{"secret":"hunter2","ttlSeconds":600}'
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/one-time-secret)

## Cloudflare features used

- Durable Objects (SQLite-backed, RPC)
- Durable Object Alarms
- Web Crypto (AES-GCM)
