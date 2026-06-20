import { Hono } from "hono";
import type { Env } from "../types/env";
import type { SimilarityResponse } from "../types/similarity";
import { validateText } from "../lib/text";
import { computeSimilarity } from "../lib/similarity";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/similarity", async (c) => {
  const text1 = validateText(c.req.query("text1"));
  if (!text1) {
    return jsonError(c, "Missing or invalid query parameter: text1", "INVALID_TEXT1");
  }

  const text2 = validateText(c.req.query("text2"));
  if (!text2) {
    return jsonError(c, "Missing or invalid query parameter: text2", "INVALID_TEXT2");
  }

  try {
    const similarity = await computeSimilarity(c.env, text1, text2);
    const response: SimilarityResponse = { text1, text2, similarity };
    return jsonSuccess(c, response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to compute similarity";
    return jsonError(c, message, "AI_ERROR", 502);
  }
});

export default app;
