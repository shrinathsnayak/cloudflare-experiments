# Image Resizer

Resize remote images at the edge using Cloudflare **Image Resizing** via `fetch` and `cf.image`.

## API

### `GET /resize`

| Query    | Required | Description                                                                |
| -------- | -------- | -------------------------------------------------------------------------- |
| `url`    | Yes      | Source image URL (`http://` or `https://` only)                            |
| `width`  | No\*     | Target width in pixels (1–4096)                                            |
| `height` | No\*     | Target height in pixels (1–4096)                                           |
| `fit`    | No       | `scale-down`, `contain`, `cover`, `crop`, or `pad` (default: `scale-down`) |

\* At least one of `width` or `height` is required.

**Example**

```http
GET /resize?url=https://example.com/image.jpg&width=800&fit=scale-down
```

**Response**

Returns the resized image binary with an appropriate `Content-Type` header.

**Errors**

- `400` - `INVALID_URL`, `INVALID_WIDTH`, `INVALID_HEIGHT`, `MISSING_DIMENSION`, or `INVALID_FIT`
- `502` - `FETCH_ERROR` (upstream fetch or resize failed)

## Run locally

```bash
cd apps/experiments/image-resizer
npm install
npm run dev
```

Then open: `http://localhost:8787/resize?url=https://example.com/image.jpg&width=800`

Image resizing requires Cloudflare Image Resizing enabled on your zone. On `workers.dev` URLs, resizing may not be available.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/image-resizer)

Deploy from [shrinathnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Image Resizing (`fetch` with `cf.image`)
