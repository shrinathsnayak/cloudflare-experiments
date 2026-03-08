# What Tech Stack Is This Website Using?

Detect technologies used by a website via headers and HTML patterns (e.g. React, Next.js, WordPress, Cloudflare, Vercel).

## API

### `GET /detect`

| Query | Required | Description                 |
| ----- | -------- | --------------------------- |
| `url` | Yes      | Website URL (http or https) |

**Example**

```http
GET /detect?url=https://www.cloudflare.com
```

**Response**

```json
{
  "technologies": ["Cloudflare", "Next.js", "React"],
  "headers": { "cf-ray": "...", "x-nextjs-cache": "..." },
  "meta": {}
}
```

**Errors**

- `400` — Missing or invalid `url`.
- `502` — Failed to fetch the page.

## Run locally

```bash
cd experiments/tech-stack-detector
npm install
npm run dev
```

Then: `http://localhost:8787/detect?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/tech-stack-detector)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Fetch API
- Header and HTML pattern analysis
