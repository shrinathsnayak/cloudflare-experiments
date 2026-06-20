# Page Metrics

Collect Puppeteer page load metrics from any website using **Cloudflare Browser Rendering**.

## API

### `GET /metrics`

| Query | Required | Description                 |
| ----- | -------- | --------------------------- |
| `url` | Yes      | Website URL (http or https) |

**Example**

```http
GET /metrics?url=https://www.cloudflare.com
```

**Response**

```json
{
  "url": "https://www.cloudflare.com/",
  "metrics": {
    "Timestamp": 12345.678,
    "Documents": 1,
    "Nodes": 842,
    "LayoutCount": 12,
    "ScriptDuration": 0.234,
    "JSHeapUsedSize": 1048576
  }
}
```

Metric keys come from Puppeteer's [`page.metrics()`](https://pptr.dev/api/puppeteer.page.metrics) API.

**Errors**

- `400` - Missing or invalid `url`.
- `502` - Navigation or metrics collection failed.

## Run locally

```bash
cd apps/experiments/page-metrics
npm install
npm run dev
```

Use `npm run dev` (runs `wrangler dev --remote`). Then:

`http://localhost:8787/metrics?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/page-metrics)

Requires a Cloudflare account with Browser Rendering enabled.

## Cloudflare features used

- Workers
- Browser Rendering (Puppeteer `page.metrics()`)
