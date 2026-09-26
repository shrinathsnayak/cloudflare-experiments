# Chat Agent

Minimal durable AI chat agent using a **SQLite-backed Durable Object**. Workers AI is optional — without an AI binding the agent echoes `agent: <message>`.

## API

### `POST /chat`

| Field       | Required | Description                             |
| ----------- | -------- | --------------------------------------- |
| `sessionId` | Yes      | Session id (letters, numbers, `_`, `-`) |
| `message`   | Yes      | User message (max 4,000 characters)     |

**Example**

```http
POST /chat
Content-Type: application/json

{ "sessionId": "demo", "message": "Hello" }
```

Returns `{ sessionId, messages }` including the user message and assistant reply.

### `GET /chat?sessionId=`

Returns chat history for the session.

### `GET /ws?sessionId=`

WebSocket upgrade for realtime message updates. Send `{ "message": "..." }` over the socket; receive `{ "type": "messages", "messages": [...] }`.

**Errors**

- `400` - `INVALID_SESSION`, `INVALID_MESSAGE`, `INVALID_BODY`, `EXPECTED_WEBSOCKET`
- `502` - `CHAT_ERROR`

## Run locally

```bash
cd apps/experiments/chat-agent
npm install
npm run dev
```

AI replies require a Workers AI binding. Without it, replies use the stub format `agent: <message>`.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/chat-agent)

## Cloudflare features used

- Durable Objects (SQLite)
- Workers AI (optional)
