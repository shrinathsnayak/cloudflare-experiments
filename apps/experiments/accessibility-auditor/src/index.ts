import { Hono } from "hono";
import type { Env } from "./types/env";
import auditRoutes from "./routes/audit";
import altTextRoutes from "./routes/alt-text";

const app = new Hono<{ Bindings: Env }>();

app.route("/", auditRoutes);
app.route("/", altTextRoutes);

app.get("/", (c) => {
  return c.json({
    name: "accessibility-auditor",
    description:
      "Run axe-core WCAG audits with Browser Rendering and suggest alt text with Workers AI",
    usage: {
      audit: "GET /audit?url=https://example.com",
      auditWithAltText: "GET /audit?url=https://example.com&altText=true",
      altText: "POST /alt-text (image body) or POST /alt-text?image=https://example.com/photo.jpg",
    },
    cloudflareFeatures: ["Browser Rendering (Puppeteer)", "Workers AI (image-to-text)"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
