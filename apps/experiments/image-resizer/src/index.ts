import { Hono } from "hono";
import type { Env } from "./types/env";
import resizeRoutes from "./routes/resize";

const app = new Hono<{ Bindings: Env }>();

app.route("/", resizeRoutes);

app.get("/", (c) => {
  return c.json({
    name: "image-resizer",
    description: "Resize remote images with Cloudflare Image Resizing at the edge",
    usage: "GET /resize?url=https://example.com/image.jpg&width=800&fit=scale-down",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
