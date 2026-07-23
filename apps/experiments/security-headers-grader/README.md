# Security Headers Grader

Grade HTTP security headers for any URL from Cloudflare's edge. Scores HSTS, CSP, clickjacking protection, and related headers with pass/warn/fail guidance.

## Features

- **GET /grade?url=** - Returns a letter grade, numeric score, per-header checks, and raw headers.
- HEAD with GET fallback when origins reject HEAD.
- Stateless; no bindings.

## API

### `GET /grade`

| Query | Required | Description                |
| ----- | -------- | -------------------------- |
| `url` | Yes      | Target URL (http or https) |

**Example**

```http
GET /grade?url=https://www.cloudflare.com
```

**Response**

```json
{
  "url": "https://www.cloudflare.com/",
  "score": 71,
  "grade": "C",
  "checks": [
    {
      "header": "Strict-Transport-Security",
      "status": "pass",
      "detail": "max-age=31536000; includeSubDomains; preload",
      "recommendation": "Looks good"
    }
  ],
  "headers": {
    "strict-transport-security": "max-age=31536000; includeSubDomains; preload"
  }
}
```

**Errors**

- `400` `INVALID_URL` - Missing or invalid `url`
- `502` `FETCH_ERROR` - Fetch failed

## Run locally

```bash
cd apps/experiments/security-headers-grader
npm install
npm run dev
```

Then open: `http://localhost:8787/grade?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/security-headers-grader)

## Cloudflare features used

- Workers
- Fetch API
- Edge networking
