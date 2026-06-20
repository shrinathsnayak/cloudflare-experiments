import { Hono } from "hono";
import type { Env } from "../types/env";
import { validatePrompt } from "../lib/prompt";
import { generateImage } from "../lib/generate";
import { jsonError } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/generate", async (c) => {
  const prompt = validatePrompt(c.req.query("prompt"));
  if (!prompt) {
    return jsonError(c, "Missing or invalid query parameter: prompt", "INVALID_PROMPT");
  }

  try {
    const image = await generateImage(c.env, prompt);
    return new Response(image, {
      status: 200,
      headers: { "Content-Type": "image/png" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate image";
    return jsonError(c, message, "AI_ERROR", 502);
  }
});

export default app;
