# Webhook Relay Inspector

Create temporary webhook endpoints and inspect captured HTTP requests using **Cloudflare Durable Objects**.

Each relay session gets a unique inbound URL. Send any HTTP request to that URL and inspect method, headers, body, and timestamp from the Worker API.

## API

### `POST /relay/new`

Creates a new relay session.

**Response**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "inboundUrl": "https://your-worker.example.com/relay/550e8400-e29b-41d4-a716-446655440000"
}
```

### `ALL /relay/:id`

Captures any HTTP request sent to the relay endpoint.

**Response**

```json
{
  "requestId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "captured": true,
  "timestamp": "2025-06-21T12:34:56.789Z"
}
```

### `GET /relay/:id/requests`

Lists captured requests for a relay session (newest first).

**Response**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "requests": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "timestamp": "2025-06-21T12:34:56.789Z",
      "method": "POST",
      "path": "/relay/550e8400-e29b-41d4-a716-446655440000"
    }
  ]
}
```

### `GET /relay/:id/requests/:requestId`

Returns full captured request details including headers and body.

## Run locally

```bash
cd apps/experiments/webhook-relay-inspector
npm install
npm run dev
```

Example flow:

```bash
curl -X POST http://localhost:8787/relay/new
curl -X POST "$INBOUND_URL" -H 'content-type: application/json' -d '{"hello":"world"}'
curl "http://localhost:8787/relay/$ID/requests"
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/webhook-relay-inspector)

## Cloudflare features used

- Workers
- Durable Objects
