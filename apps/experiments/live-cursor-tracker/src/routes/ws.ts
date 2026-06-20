import { Hono } from "hono";
import type { Env } from "../types/env";
import { DEMO_HTML } from "../lib/demo-page";

const app = new Hono<{ Bindings: Env }>();

function validateRoom(room: string): string | null {
  const trimmed = room.trim();
  if (!trimmed || trimmed.length > 64 || !/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

app.get("/", (c) => {
  return c.html(DEMO_HTML);
});

app.get("/ws/:room", async (c) => {
  const room = validateRoom(c.req.param("room"));
  if (!room) {
    return c.json({ error: "Invalid room name", code: "INVALID_ROOM" }, 400);
  }

  if (c.req.header("Upgrade") !== "websocket") {
    return c.text("Expected WebSocket upgrade", 426);
  }

  const id = c.env.ROOMS.idFromName(room);
  const stub = c.env.ROOMS.get(id);
  return stub.fetch(c.req.raw);
});

export default app;
