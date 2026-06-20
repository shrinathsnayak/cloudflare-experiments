import { Hono } from "hono";
import type { Env } from "../types/env";
import type { SentimentResponse } from "../types/sentiment";
import { validateText } from "../lib/text";
import { analyzeSentiment } from "../lib/sentiment";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/sentiment", async (c) => {
  const text = validateText(c.req.query("text"));
  if (!text) {
    return jsonError(c, "Missing or invalid query parameter: text", "INVALID_TEXT");
  }

  try {
    const result = await analyzeSentiment(c.env, text);
    const response: SentimentResponse = { text, ...result };
    return jsonSuccess(c, response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to analyze sentiment";
    return jsonError(c, message, "AI_ERROR", 502);
  }
});

export default app;
