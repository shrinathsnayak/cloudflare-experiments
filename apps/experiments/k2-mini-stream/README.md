# K2 Mini Stream

Produce events to Cloudflare K2 and read them back in order.

## Features

- **GET /demo** - Create a K2 stream, produce sample events, consume them via subscription, and acknowledge
- Demonstrates K2's durable event log built on R2
- Shows produce → subscribe → consume → acknowledge workflow
- No persistent storage in the Worker; K2 handles durability

## API

### `GET /demo`

No query parameters required. This endpoint:
1. Creates a K2 stream with 1-hour retention
2. Produces 3 sample order/shipment events
3. Creates a subscription starting from the earliest record
4. Consumes the records and decodes them
5. Acknowledges the batch

**Example request**

```http
GET /demo
```

**Example response**

```json
{
  "streamId": "abc123...",
  "streamName": "demo-stream-1696345678901",
  "produced": 3,
  "consumed": 3,
  "events": [
    { "id": 1, "type": "order", "product": "widget", "quantity": 5, "timestamp": 1696345678901 },
    { "id": 2, "type": "order", "product": "gadget", "quantity": 3, "timestamp": 1696345678902 },
    { "id": 3, "type": "shipment", "orderId": 1, "status": "shipped", "timestamp": 1696345678903 }
  ]
}
```

**Errors**

- `500` - Missing K2_ACCOUNT_ID or K2_API_TOKEN
- `502` - K2 API error

## Configuration

This experiment requires K2 API credentials set as environment variables in `wrangler.json` or via the dashboard:

```json
{
  "vars": {
    "K2_ACCOUNT_ID": "your-account-id",
    "K2_API_TOKEN": "your-k2-api-token"
  }
}
```

Get your K2 API token from the Cloudflare dashboard with `K2 Produce` and `K2 Consume` permissions.

## Run locally

```bash
cd apps/experiments/k2-mini-stream
npm install
npm run dev
```

Then open: `http://localhost:8787/demo`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/k2-mini-stream)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

After deployment, set K2_ACCOUNT_ID and K2_API_TOKEN in the dashboard.

## Cloudflare features used

- Workers
- [K2](https://developers.cloudflare.com/k2/) - Serverless event log on R2 (Oct 1, 2026 public beta)
- K2 Streams, Produce, Subscribe, Consume, and Acknowledge APIs
