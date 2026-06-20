import { Hono } from "hono";
import type { Env } from "../types/env";
import type { HashResponse } from "../types/hash";
import { hashText, normalizeAlgorithm, validateText } from "../lib/hash";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/hash", async (c) => {
  const text = validateText(c.req.query("text"));
  if (!text) {
    return jsonError(c, "Missing or invalid query parameter: text", "INVALID_TEXT");
  }

  const algorithm = normalizeAlgorithm(c.req.query("algorithm"));
  if (!algorithm) {
    return jsonError(
      c,
      "Invalid query parameter: algorithm (supported: SHA-256, SHA-384, SHA-512)",
      "INVALID_ALGORITHM"
    );
  }

  try {
    const hash = await hashText(text, algorithm);
    const response: HashResponse = {
      algorithm,
      hash,
      inputLength: text.length,
    };
    return jsonSuccess(c, response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to compute hash";
    return jsonError(c, message, "HASH_ERROR", 502);
  }
});

export default app;
