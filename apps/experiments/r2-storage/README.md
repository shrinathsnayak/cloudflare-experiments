# R2 Storage

Use Cloudflare R2 from a Worker with configurable list/get/put/delete and **public vs private** buckets for images.

## Features

- **Private bucket**: Objects only reachable via the Worker (`GET /object?key=...`). No direct public URL.
- **Public bucket**: Upload with `public=true`; object is reachable at your R2 public URL (e.g. `https://pub-xxx.r2.dev/key`) when public access is enabled and `PUBLIC_BUCKET_URL` is set.
- **List** with `prefix`, `limit`, `cursor`, `delimiter`; use `public=true` to list the public bucket.
- **Put** with `Content-Type` (e.g. `image/png`) and optional `X-Custom-Metadata-*` headers.

## Setup (for upload and test)

1. **Create two R2 buckets** in [Cloudflare dashboard](https://dash.cloudflare.com/) → R2 → Create bucket:
   - `r2-storage-bucket` (private — leave default)
   - `r2-storage-public` (for public images)

2. **Enable public access** on the public bucket only (see [How to get PUBLIC_BUCKET_URL](#how-to-get-public_bucket_url) below).

3. **Configure Worker** in `wrangler.json`:
   - Set `bucket_name` for both `BUCKET` and `PUBLIC_BUCKET` to match your bucket names.
   - Set `vars.PUBLIC_BUCKET_URL` to the public bucket URL (e.g. `https://pub-xxxxx.r2.dev`) so the API can return a `url` after upload.

4. **Run locally** (use real R2 for public URL to work):

```bash
cd experiments/r2-storage
npm install
npm run dev -- --remote
```

Use your Worker URL (e.g. `http://localhost:8787` or your deployed Worker URL).

### How to get PUBLIC_BUCKET_URL

The public bucket URL is the base address where your R2 bucket is exposed (e.g. `https://pub-xxxxx.r2.dev`). Objects are then at `PUBLIC_BUCKET_URL/your-key`.

1. In the [Cloudflare dashboard](https://dash.cloudflare.com/), go to **R2** → select your **public** bucket (e.g. `r2-storage-public`).
2. Open **Settings** for that bucket.
3. Under **Public Development URL** (or **Public access**), click **Enable**.
4. When prompted, type `allow` and confirm. Cloudflare will enable a managed `r2.dev` subdomain for the bucket.
5. The **Public Bucket URL** (or **Public Development URL**) is shown in the same Settings section — it looks like `https://pub-<id>.r2.dev`. Copy that full URL (no trailing slash).
6. Set it as `PUBLIC_BUCKET_URL` in `wrangler.json` under `vars`, or after deploy set it in **Workers & Pages** → your Worker → **Settings** → **Variables**.

If you use a **custom domain** instead of the r2.dev URL, use that domain as `PUBLIC_BUCKET_URL` (e.g. `https://assets.example.com`).

---

## Upload and test

Replace `BASE` with your Worker base URL (e.g. `http://localhost:8787` or `https://your-worker.workers.dev`).

### 1. Private image (only via Worker)

Upload an image to the **private** bucket. It is only accessible through the Worker, not via a direct public URL.

**Upload**

```bash
# Upload a local image (e.g. screenshot or photo)
curl -X PUT "$BASE/object?key=private/photo.png" \
  -H "Content-Type: image/png" \
  --data-binary @./your-image.png
```

Expected: `{"key":"private/photo.png","uploaded":true}` (no `url` — private).

**Download / test**

```bash
# Get the image via the Worker (saves to file)
curl -o out.png "$BASE/object?key=private/photo.png"
# Or open in browser (if HTML): <img src="$BASE/object?key=private/photo.png" />
```

**List private objects**

```bash
curl "$BASE/list?prefix=private/"
```

---

### 2. Public image (direct URL + Worker)

Upload an image to the **public** bucket. Once `PUBLIC_BUCKET_URL` is set, the upload response includes a `url` you can open in a browser or share.

**Upload**

```bash
curl -X PUT "$BASE/object?key=public/photo.png&public=true" \
  -H "Content-Type: image/png" \
  --data-binary @./your-image.png
```

Expected: `{"key":"public/photo.png","uploaded":true,"url":"https://pub-xxxxx.r2.dev/public/photo.png"}`.

**Test**

- **Direct public URL**: Open the `url` from the response in a browser (no Worker involved).
- **Via Worker**:
  `curl -o out.png "$BASE/object?key=public/photo.png&public=true"`

**List public objects**

```bash
curl "$BASE/list?public=true&prefix=public/"
```

---

### 3. Quick test without a real image file

**Private text “object”**

```bash
curl -X PUT "$BASE/object?key=private/hello.txt" -H "Content-Type: text/plain" -d "hello private"
curl "$BASE/object?key=private/hello.txt"
```

**Public text “object”** (if public bucket and `PUBLIC_BUCKET_URL` are set)

```bash
curl -X PUT "$BASE/object?key=public/hello.txt&public=true" -H "Content-Type: text/plain" -d "hello public"
# Then open the returned url in browser, or:
curl "$BASE/object?key=public/hello.txt&public=true"
```

---

## API

### `GET /list`

| Query       | Required | Description                              |
| ----------- | -------- | ---------------------------------------- |
| `public`    | No       | `true` or `1` to list the public bucket  |
| `prefix`    | No       | List only keys with this prefix          |
| `limit`     | No       | Max keys (1–1000)                        |
| `cursor`    | No       | Pagination cursor from previous response |
| `delimiter` | No       | e.g. `/` for directory-style listing     |

### `GET /object` / `HEAD /object`

| Query    | Required | Description                            |
| -------- | -------- | -------------------------------------- |
| `key`    | Yes      | Object key                             |
| `public` | No       | `true` or `1` to use the public bucket |

### `PUT /object`

| Query    | Required | Description                                  |
| -------- | -------- | -------------------------------------------- |
| `key`    | Yes      | Object key                                   |
| `public` | No       | `true` or `1` to upload to the public bucket |

Body: raw bytes. Set `Content-Type` (e.g. `image/png`, `image/jpeg`). Optional: `X-Custom-Metadata-*` headers.

Response for public uploads includes `url` when `PUBLIC_BUCKET_URL` is set.

### `DELETE /object`

| Query    | Required | Description                                |
| -------- | -------- | ------------------------------------------ |
| `key`    | Yes      | Object key                                 |
| `public` | No       | `true` or `1` to delete from public bucket |

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/r2-storage)

1. Create the two R2 buckets and enable public access on the public one.
2. In **Workers & Pages** → your Worker → **Settings** → **Variables**, add `PUBLIC_BUCKET_URL` = your public bucket URL (e.g. `https://pub-xxxxx.r2.dev`).
3. Ensure `wrangler.json` has the correct `bucket_name` for both bindings.

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- R2 (private and public bucket bindings)
- Hono
