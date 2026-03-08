# Global API Tester

Test API endpoints from Cloudflare's global edge and get real response time and status.

## API

### `GET /test`

| Query | Required | Description |
|-------|----------|-------------|
| `url` | Yes | API URL (http or https) |

**Example**

```http
GET /test?url=https://api.example.com
```

**Response**

```json
{
  "status": 200,
  "latency": 42,
  "ok": true
}
```

**Errors**

- `400` — Missing or invalid `url`.

## Run locally

```bash
cd experiments/global-api-tester
npm install
npm run dev
```

Then: `http://localhost:8787/test?url=https://api.example.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/global-api-tester)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Fetch API
