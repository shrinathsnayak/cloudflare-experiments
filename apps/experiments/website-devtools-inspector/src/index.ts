import { Hono } from "hono";
import type { Env } from "./types/env";
import devtoolsRoutes from "./routes/devtools";

const app = new Hono<{ Bindings: Env }>();

app.route("/", devtoolsRoutes);

app.get("/", (c) => {
  return c.json({
    name: "website-devtools-inspector",
    description: "Inspect any website like DevTools (headers, cookies, scripts, assets, metadata)",
    usage: "GET /devtools?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
