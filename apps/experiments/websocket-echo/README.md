# WebSocket Echo

WebSocket echo server running on Cloudflare Workers.

## Features

- **GET /echo** - Upgrades to WebSocket and echoes every message back with an `echo: ` prefix.
- Demonstrates the Workers WebSocket API with `WebSocketPair`.
- No bindings; stateless per-connection echo.

## API

### `GET /echo`

Requires a WebSocket upgrade request (`Upgrade: websocket`).

**Example (websocat)**

```bash
websocat wss://your-worker.workers.dev/echo
```

Send any text message; the server replies with `echo: <your message>`.

**Non-WebSocket request**

Returns `426` with:

```json
{
  "error": "Expected WebSocket upgrade request (Upgrade: websocket)",
  "code": "NOT_WEBSOCKET"
}
```

## Run locally

```bash
cd apps/experiments/websocket-echo
npm install
npm run dev
```

Connect with a WebSocket client to `ws://localhost:8787/echo`.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/websocket-echo)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- WebSockets (`WebSocketPair`)
