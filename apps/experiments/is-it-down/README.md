# Is It Down?

Check whether a website is reachable from Cloudflare's edge network.

## Features

- **GET /check?url=** — Returns reachability, response time, status code, and edge colo (when deployed).
- No persistent storage; stateless.
- Runs on the edge in under 60 seconds.

## API

### `GET /check`

| Query | Required | Description                |
| ----- | -------- | -------------------------- |
| `url` | Yes      | Target URL (http or https) |

**Example**

```http
GET /check?url=https://www.cloudflare.com
```

**Response (reachable)** — when deployed, `colo` is the edge data center (IATA code) that served the check.

```json
{
  "status": "reachable",
  "responseTime": 87,
  "statusCode": 200,
  "colo": "LHR"
}
```

**Response (unreachable)**

```json
{
  "status": "unreachable",
  "responseTime": 5000,
  "statusCode": 0,
  "colo": "SFO",
  "error": "The operation was aborted."
}
```

**Errors**

- `400` — Missing or invalid `url` (e.g. not http/https).

## Run locally

```bash
cd experiments/is-it-down
npm install
npm run dev
```

Then open: `http://localhost:8787/check?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/is-it-down)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Fetch API
- Edge networking
