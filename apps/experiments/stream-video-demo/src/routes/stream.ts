import { Hono } from "hono";
import type { Env } from "../types/env";
import {
  createPlaybackToken,
  createUploadUrl,
  parseMaxDurationSeconds,
  validateUid,
} from "../lib/stream";
import { jsonError, jsonSuccess } from "../utils/response";

const streamRoutes = new Hono<{ Bindings: Env }>();

streamRoutes.post("/upload-url", async (c) => {
  let body: unknown = undefined;
  const contentType = c.req.header("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      body = await c.req.json();
    } catch {
      return jsonError(c, "Invalid JSON body", "INVALID_BODY");
    }
  } else {
    const text = await c.req.text();
    if (text.trim()) {
      try {
        body = JSON.parse(text);
      } catch {
        return jsonError(c, "Invalid JSON body", "INVALID_BODY");
      }
    }
  }

  const maxDurationSeconds = parseMaxDurationSeconds(body);
  if (maxDurationSeconds === null) {
    return jsonError(
      c,
      "maxDurationSeconds must be an integer between 1 and 21600",
      "INVALID_BODY"
    );
  }

  try {
    const result = await createUploadUrl(c.env.STREAM, maxDurationSeconds);
    return jsonSuccess(c, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stream upload URL failed";
    return jsonError(c, message, "STREAM_ERROR", 502);
  }
});

streamRoutes.get("/playback-token", async (c) => {
  const uid = validateUid(c.req.query("uid"));
  if (!uid) {
    return jsonError(c, "Missing or invalid query parameter: uid", "INVALID_UID");
  }

  try {
    const result = await createPlaybackToken(c.env.STREAM, uid);
    return jsonSuccess(c, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stream token generation failed";
    return jsonError(c, message, "STREAM_ERROR", 502);
  }
});

export default streamRoutes;
