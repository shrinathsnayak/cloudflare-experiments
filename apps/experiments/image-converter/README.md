# Image Converter

Convert, resize, and watermark images to **WebP / AVIF / JPEG / PNG** with the Cloudflare **Images binding** (`env.IMAGES`) — works on raw bytes, so no public image URL or zone-level Image Resizing is needed.

## API

All conversion routes share these query params:

| Query     | Default | Description                                                                         |
| --------- | ------- | ----------------------------------------------------------------------------------- |
| `format`  | `webp`  | `webp`, `avif`, `jpeg` (or `jpg`), `png`                                            |
| `quality` | —       | Integer 1–100 (ignored for `png`)                                                   |
| `width`   | —       | Integer 1–4096                                                                      |
| `height`  | —       | Integer 1–4096                                                                      |
| `fit`     | —       | `scale-down`, `contain`, `cover`, `crop`, `pad`, `squeeze` (needs `width`/`height`) |

Responses are the converted image bytes with headers:

```http
Content-Type: image/webp
X-Original-Format: image/jpeg
X-Original-Size: 47707
X-Output-Size: 4264
X-Size-Saved-Percent: 91.1
```

### `POST /convert`

Body: image bytes (`Content-Type: image/*`, max 10 MB).

```bash
curl -X POST "http://localhost:8787/convert?format=webp&quality=70&width=800" \
  -H "Content-Type: image/jpeg" --data-binary @photo.jpg -o photo.webp
```

### `GET /convert?url=`

Same as above for a remote image (must return `image/*`, max 10 MB).

```bash
curl "http://localhost:8787/convert?url=https://example.com/photo.jpg&format=avif&width=600" -o photo.avif
```

### `POST /watermark?watermarkUrl=`

Draws a remote image (ideally a transparent PNG) bottom-right with 16 px margin at 0.6 opacity. Accepts the same conversion params.

```bash
curl -X POST "http://localhost:8787/watermark?watermarkUrl=https://example.com/logo.png&format=jpeg" \
  -H "Content-Type: image/jpeg" --data-binary @photo.jpg -o watermarked.jpg
```

### `POST /info`

```json
{ "format": "image/jpeg", "fileSize": 47707, "width": 1600, "height": 1000 }
```

SVG input returns `width` / `height` as `null`.

### Errors

| Status | Code                     | When                                                 |
| ------ | ------------------------ | ---------------------------------------------------- |
| 400    | `INVALID_FORMAT`         | Unknown `format`                                     |
| 400    | `INVALID_QUALITY`        | `quality` not an integer 1–100                       |
| 400    | `INVALID_DIMENSIONS`     | `width`/`height` not 1–4096, or `fit` without either |
| 400    | `INVALID_FIT`            | Unknown `fit`                                        |
| 400    | `INVALID_URL`            | Missing/invalid `url` or `watermarkUrl`              |
| 400    | `MISSING_IMAGE`          | Empty body                                           |
| 413    | `PAYLOAD_TOO_LARGE`      | Image over 10 MB                                     |
| 415    | `UNSUPPORTED_MEDIA_TYPE` | Not `image/*`, or the binding can't decode it        |
| 502    | `FETCH_ERROR`            | Remote image / watermark fetch failed                |
| 502    | `IMAGES_ERROR`           | Images binding transform failed                      |

## Privacy: metadata stripping

Re-encoding drops invisible EXIF metadata such as GPS location and camera details. Per the [Images docs](https://developers.cloudflare.com/images/transform-images/transform-via-url/#metadata), WebP and PNG output always discards metadata; JPEG output defaults to keeping only the EXIF copyright tag. The binding's `output()` exposes no `metadata` option, so this default applies.

## Run locally

```bash
cd apps/experiments/image-converter
npm install
npm run dev
```

`wrangler dev` uses a low-fidelity local Images implementation (resize, rotate, format only). Use `npx wrangler dev --remote` to test `draw()` watermarks and full fidelity.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/image-converter)

Calls are billed as Images unique transformations; `info()` is free.

## Cloudflare features used

- Workers
- [Images binding](https://developers.cloudflare.com/images/transform-images/bindings/) (`input().transform().draw().output()`, `info()`)
