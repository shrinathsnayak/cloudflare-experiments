# Edge Redirect Simulator

Show redirect chains for any URL from Cloudflare's edge. Follows HTTP redirects (301, 302, 303, 307, 308) and returns each hop with its status code.

## API

- **Route**: `GET /redirect-chain?url=<url>`
- **Query**: `url` (required). Full URL (`https://cloudflare.com`) or hostname (`example.com`); only `http` and `https` are allowed.
- **Response**: JSON with a `chain` array of `{ url, status }` for each hop, and optional `error` if the chain was truncated (e.g. missing `Location`, loop, or max redirects exceeded).

### Example

```bash
GET /redirect-chain?url=example.com
```

Response:

```json
{
  "chain": [
    { "url": "https://cloudflare.com/", "status": 301 },
    { "url": "https://www.example.com/", "status": 302 },
    { "url": "https://final.example.com/", "status": 200 }
  ]
}
```

Display form: `example.com -> 301` → `www.example.com -> 302` → `final.example.com -> 200`.

### Errors

- **400** `INVALID_URL`: Missing or invalid `url` (e.g. wrong scheme, malformed).
- **500** `INTERNAL_ERROR`: Uncaught error (e.g. fetch failure).

If the chain hits a redirect with no `Location` or exceeds the hop limit, the response is still **200** with the `chain` collected so far and an `error` message.

## Run locally

```bash
cd experiments/edge-redirect-simulator
npm install
npm run dev
```

Then open: `http://localhost:8787/redirect-chain?url=https://cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/edge-redirect-simulator)

## Tests

```bash
npm run test
```
