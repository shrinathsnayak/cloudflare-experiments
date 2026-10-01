import { Hono } from "hono";
import type { Env } from "./types/env";
import listenRoutes from "./routes/listen";
import textRoutes from "./routes/text";
import { MAX_CHARS, TTS_MODELS } from "./constants/defaults";

const app = new Hono<{ Bindings: Env }>();

app.route("/", listenRoutes);
app.route("/", textRoutes);

app.get("/", (c) => {
  return c.json({
    name: "article-to-audio",
    description:
      "Listen to any article: HTMLRewriter extraction, Workers AI text-to-speech, and R2 caching",
    usage: "GET /listen?url=https://example.com/post&lang=en (audio/mpeg), GET /text?url=",
    models: TTS_MODELS,
    maxChars: MAX_CHARS,
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
