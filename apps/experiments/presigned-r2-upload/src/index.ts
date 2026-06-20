import { Hono } from "hono";
import type { Env } from "./types/env";
import { DEMO_HTML } from "./lib/demo-page";
import presignRoutes from "./routes/presign";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.html(DEMO_HTML));
app.route("/", presignRoutes);

app.get("/info", (c) => {
  return c.json({
    name: "presigned-r2-upload",
    description: "Generate presigned PUT URLs for direct browser-to-R2 uploads",
    usage: {
      presign: 'POST /presign { "filename", "contentType" }',
      demo: "GET / (upload form)",
    },
    cloudflareFeatures: ["R2", "aws4fetch presigned URLs"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
