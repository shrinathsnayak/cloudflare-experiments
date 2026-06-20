import { Hono } from "hono";
import type { Env } from "./types/env";
import transcribeRoutes from "./routes/transcribe";

const app = new Hono<{ Bindings: Env }>();

app.route("/", transcribeRoutes);

app.get("/", (c) => {
  return c.json({
    name: "speech-to-text-transcriber",
    description: "Transcribe uploaded audio with Workers AI Whisper",
    usage: "POST /transcribe (multipart form field: audio)",
    cloudflareFeatures: ["Workers AI"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
