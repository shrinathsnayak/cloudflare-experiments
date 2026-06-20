---
name: websocket-echo
description: Use when editing websocket-echo. GET /echo WebSocket upgrade; echoes messages.
---

# WebSocket Echo

- **Route**: `GET /echo` (WebSocket upgrade required)
- **Behavior**: Prefixes each message with `echo: `
- **Bindings**: None. Uses `WebSocketPair`.
