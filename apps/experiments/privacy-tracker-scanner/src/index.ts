import { Hono } from "hono";
import type { Env } from "./types/env";
import scanRoutes from "./routes/scan";

const app = new Hono<{ Bindings: Env }>();

app.route("/", scanRoutes);

app.get("/", (c) => {
  return c.json({
    name: "privacy-tracker-scanner",
    description:
      "Load a page with Browser Rendering (no consent clicks) and report third-party trackers and cookies",
    usage: "GET /scan?url=https://example.com",
    cloudflareFeatures: ["Browser Rendering (Puppeteer + CDP)"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
