# Presigned R2 Upload

Generate presigned PUT URLs so browsers upload directly to R2 without routing file bytes through the Worker.

## Setup

Set secrets:

```bash
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
```

Set `R2_ACCOUNT_ID` in `wrangler.json` vars. Configure R2 CORS on the bucket for browser PUT uploads.

## API

- **POST /presign** — `{ "filename": "photo.png", "contentType": "image/png" }`
- **GET /** — Demo upload form

Allowed content types: `image/png`, `image/jpeg`, `image/webp`, `text/plain`, `application/pdf` (max 5MB documented).

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/presigned-r2-upload)

## Cloudflare features used

- R2
- aws4fetch presigned URLs
