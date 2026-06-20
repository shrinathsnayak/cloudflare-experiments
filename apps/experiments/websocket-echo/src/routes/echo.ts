import { Hono } from "hono";
import type { Env } from "../types/env";
import { createEchoWebSocket, isWebSocketUpgrade } from "../lib/websocket";
import { jsonError } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/echo", (c) => {
  if (!isWebSocketUpgrade(c.req.raw)) {
    return jsonError(
      c,
      "Expected WebSocket upgrade request (Upgrade: websocket)",
      "NOT_WEBSOCKET",
      426
    );
  }

  return createEchoWebSocket();
});

export default app;
