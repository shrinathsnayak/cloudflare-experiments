# Stream Video Demo

Create **Cloudflare Stream** direct upload URLs and signed playback tokens from a Worker via the Stream binding — no API tokens required in application code.

## Setup

Enable Stream on your account, then deploy with the binding in `wrangler.json`:

```json
{
  "stream": { "binding": "STREAM" }
}
```

Locally, if the Stream binding is unavailable or methods throw, endpoints return demo values with `"mode": "demo"`.

## API

### `POST /upload-url`

Optional JSON body:

| Field                | Required | Description                                         |
| -------------------- | -------- | --------------------------------------------------- |
| `maxDurationSeconds` | No       | Max video length in seconds (1–21600, default 3600) |

**Response**

```json
{
  "uploadURL": "https://upload.cloudflarestream.com/...",
  "uid": "video-uid",
  "mode": "live",
  "maxDurationSeconds": 3600
}
```

**Errors**

- `400` - `INVALID_BODY`
- `502` - `STREAM_ERROR`

### `GET /playback-token?uid=`

| Param | Required | Description      |
| ----- | -------- | ---------------- |
| `uid` | Yes      | Stream video UID |

**Response**

```json
{
  "token": "signed-playback-token",
  "uid": "video-uid",
  "playbackUrl": "https://videodelivery.net/signed-playback-token/manifest/video.m3u8",
  "mode": "live"
}
```

**Errors**

- `400` - `INVALID_UID`
- `502` - `STREAM_ERROR`

## Run locally

```bash
cd apps/experiments/stream-video-demo
npm install
npm run dev
```

Without a live Stream binding, responses include `"mode": "demo"`.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/stream-video-demo)

## Cloudflare features used

- Cloudflare Stream
- Stream Workers binding
- Direct creator uploads
- Signed playback tokens
