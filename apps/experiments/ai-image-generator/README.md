# AI Image Generator

Generate images from text prompts with **Workers AI** (`@cf/black-forest-labs/flux-1-schnell`) at the edge.

## API

### `GET /generate`

| Query    | Required | Description                   |
| -------- | -------- | ----------------------------- |
| `prompt` | Yes      | Text prompt (max 1,000 chars) |

**Example**

```http
GET /generate?prompt=a sunset over snow-capped mountains
```

**Response**

Binary PNG image with `Content-Type: image/png`.

**Errors**

- `400` - `INVALID_PROMPT`
- `502` - `AI_ERROR` (model run failed)

## Run locally

```bash
cd apps/experiments/ai-image-generator
npm install
npm run dev
```

Then open: `http://localhost:8787/generate?prompt=a%20cyberpunk%20cityscape`

Requires a Cloudflare account with Workers AI enabled.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ai-image-generator)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Workers AI (`@cf/black-forest-labs/flux-1-schnell`)
