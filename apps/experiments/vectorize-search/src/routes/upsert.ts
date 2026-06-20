import { Hono } from "hono";
import type { Env } from "../types/env";
import type { UpsertRequest, UpsertResponse } from "../types/search";
import { validateId } from "../lib/id";
import { validateText } from "../lib/text";
import { embedText } from "../lib/embed";
import { upsertVector } from "../lib/vectorize";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/upsert", async (c) => {
  let body: UpsertRequest;
  try {
    body = await c.req.json<UpsertRequest>();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_BODY");
  }

  const id = validateId(body.id);
  if (!id) {
    return jsonError(c, "Missing or invalid field: id", "INVALID_ID");
  }

  const text = validateText(body.text);
  if (!text) {
    return jsonError(c, "Missing or invalid field: text", "INVALID_TEXT");
  }

  try {
    const values = await embedText(c.env, text);
    await upsertVector(c.env, id, values, text);
    const response: UpsertResponse = { id };
    return jsonSuccess(c, response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upsert vector";
    return jsonError(c, message, "VECTORIZE_ERROR", 502);
  }
});

export default app;
