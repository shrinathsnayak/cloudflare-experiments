import { Hono } from "hono";
import type { Env } from "./types/env";
import streamRoutes from "./routes/stream";

const app = new Hono<{ Bindings: Env }>();

app.route("/", streamRoutes);

app.get("/", (c) => {
  return c.json({
    name: "stream-video-demo",
    description:
      "Create Cloudflare Stream direct upload URLs and generate signed playback tokens via the Workers Stream binding",
    usage: {
      uploadUrl: "POST /upload-url with optional JSON { maxDurationSeconds?: number }",
      playbackToken: "GET /playback-token?uid=VIDEO_UID",
    },
    cloudflareFeatures: ["Stream", "Stream Workers binding", "Signed URLs"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
