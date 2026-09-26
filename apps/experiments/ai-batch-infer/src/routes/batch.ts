import { Hono } from "hono";
import type { Env } from "../types/env";
import {
  demoPollResponse,
  demoQueuedResponse,
  hasAIBinding,
  pollBatch,
  resolveModel,
  submitBatch,
  validateRequestId,
  validateTexts,
} from "../lib/batch";
import { jsonError, jsonSuccess } from "../utils/response";

const batchRoutes = new Hono<{ Bindings: Env }>();

batchRoutes.post("/batch", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return jsonError(c, "Request body must be valid JSON", "INVALID_BODY");
  }

  const texts = validateTexts(body);
  if (!texts) {
    return jsonError(
      c,
      "Body must include texts: string[] with 1–20 non-empty items (max 2000 chars each)",
      "INVALID_BODY"
    );
  }

  const model = resolveModel(c.env.MODEL);

  if (!hasAIBinding(c.env.AI)) {
    return jsonSuccess(c, demoQueuedResponse(model));
  }

  try {
    const result = await submitBatch(c.env.AI, model, texts);
    return jsonSuccess(c, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Batch submit failed";
    return jsonError(c, message, "BATCH_ERROR", 502);
  }
});

batchRoutes.get("/batch/:requestId", async (c) => {
  const requestId = validateRequestId(c.req.param("requestId"));
  if (!requestId) {
    return jsonError(c, "Missing or invalid requestId path parameter", "INVALID_REQUEST_ID");
  }

  const model = resolveModel(c.env.MODEL);

  if (!hasAIBinding(c.env.AI)) {
    return jsonSuccess(c, demoPollResponse(requestId, model));
  }

  try {
    const result = await pollBatch(c.env.AI, model, requestId);
    return jsonSuccess(c, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Batch poll failed";
    return jsonError(c, message, "BATCH_ERROR", 502);
  }
});

export default batchRoutes;
