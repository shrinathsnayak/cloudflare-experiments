# Crypto Hash

Compute SHA digests with the Web Crypto API at the edge.

## Features

- **GET /hash?text=** - Returns a hex-encoded digest for the input text.
- Supports **SHA-256**, **SHA-384**, and **SHA-512** (default: SHA-256).
- No bindings; stateless cryptography via `crypto.subtle`.

## API

### `GET /hash`

| Query       | Required | Description                                  |
| ----------- | -------- | -------------------------------------------- |
| `text`      | Yes      | Input string to hash (max 10,000 characters) |
| `algorithm` | No       | `SHA-256`, `SHA-384`, or `SHA-512`           |

**Example**

```http
GET /hash?text=hello&algorithm=SHA-256
```

**Response**

```json
{
  "algorithm": "SHA-256",
  "hash": "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
  "inputLength": 5
}
```

**Errors**

- `400` - Missing or invalid `text` or `algorithm`

## Run locally

```bash
cd apps/experiments/crypto-hash
npm install
npm run dev
```

Then open: `http://localhost:8787/hash?text=hello`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/crypto-hash)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Web Crypto API (`crypto.subtle.digest`)
