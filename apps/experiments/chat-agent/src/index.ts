import { Hono } from "hono";
import type { Env } from "./types/env";
import chatRoutes from "./routes/chat";

const app = new Hono<{ Bindings: Env }>();

app.route("/", chatRoutes);

app.get("/", (c) => {
  return c.json({
    name: "chat-agent",
    description:
      "Minimal durable AI chat agent with SQLite-backed Durable Objects and optional Workers AI",
    usage: {
      chat: 'POST /chat with { "sessionId": "...", "message": "..." }',
      history: "GET /chat?sessionId=...",
      websocket: "GET /ws?sessionId=... (WebSocket upgrade)",
    },
    cloudflareFeatures: ["Agents / Durable Objects", "Workers AI"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export { ChatAgent } from "./chat-agent";
export default { fetch: app.fetch };
