import { Hono } from "hono";
import type { Env } from "./types/env";
import echoRoutes from "./routes/echo";

const app = new Hono<{ Bindings: Env }>();

app.route("/", echoRoutes);

app.get("/", (c) => {
  return c.json({
    name: "container-echo",
    description: "Echo a message via Cloudflare Containers",
    usage: {
      echo: "POST /echo with text/plain or JSON body { message }",
    },
    cloudflareFeatures: ["Containers", "Durable Objects"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default app;
