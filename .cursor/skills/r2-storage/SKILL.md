---
name: r2-storage
description: Use when editing r2-storage. GET /list, GET/PUT/DELETE /object; private and public R2 buckets; PUBLIC_BUCKET_URL for public URLs.
---

# R2 Storage

- **Routes**: `GET /list`, `GET /object`, `HEAD /object`, `PUT /object`, `DELETE /object`.
- **Inputs**: `key` (object), `public` (optional), `prefix`, `limit`, `cursor`, `delimiter` (list).
- **Outputs**: List (objects + cursor); object GET/HEAD (body/headers); PUT returns `{ key, uploaded, url? }`.
- **Bindings**: R2 (BUCKET, PUBLIC_BUCKET), var PUBLIC_BUCKET_URL.
