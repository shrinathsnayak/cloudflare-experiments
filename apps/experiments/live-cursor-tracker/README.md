# Live Cursor Tracker

Real-time shared cursor positions using a Durable Object room and the WebSocket Hibernation API. Open multiple tabs to `/` and move your mouse to see colored cursors sync across clients.

## Features

- **GET /** — Demo page with canvas and WebSocket client
- **GET /ws/:room** — WebSocket upgrade; one DO instance per room name
- Hibernation-friendly: `acceptWebSocket`, `webSocketMessage`, `webSocketClose`

## Run locally

```bash
cd apps/experiments/live-cursor-tracker
npm install
npm run dev
```

Open `http://localhost:8787/` in two browser tabs.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/live-cursor-tracker)

## Cloudflare features used

- Durable Objects
- WebSocket Hibernation API
