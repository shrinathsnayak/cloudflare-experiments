import { Hono } from "hono";
import type { Env } from "../types/env";
import type { SearchResponse } from "../types/search";
import { validateText } from "../lib/text";
import { parseTopK } from "../lib/topk";
import { embedText } from "../lib/embed";
import { searchVectors } from "../lib/vectorize";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/search", async (c) => {
  const query = validateText(c.req.query("q"));
  if (!query) {
    return jsonError(c, "Missing or invalid query parameter: q", "INVALID_QUERY");
  }

  const topK = parseTopK(c.req.query("topK"));
  if (topK === null) {
    return jsonError(c, "Invalid query parameter: topK (must be 1-20)", "INVALID_TOP_K");
  }

  try {
    const values = await embedText(c.env, query);
    const results = await searchVectors(c.env, values, topK);
    const response: SearchResponse = { query, results };
    return jsonSuccess(c, response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to search vectors";
    return jsonError(c, message, "VECTORIZE_ERROR", 502);
  }
});

export default app;
