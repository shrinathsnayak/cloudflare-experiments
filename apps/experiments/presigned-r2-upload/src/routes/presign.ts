import { Hono } from "hono";
import type { Env } from "../types/env";
import type { PresignResponse } from "../types/env";
import {
  MAX_FILE_BYTES,
  PRESIGN_TTL_SECONDS,
  createPresignedPutUrl,
  validateContentType,
  validateFilename,
} from "../lib/presign";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/presign", async (c) => {
  let body: { filename?: unknown; contentType?: unknown };
  try {
    body = await c.req.json<{ filename?: unknown; contentType?: unknown }>();
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }

  const filename = validateFilename(body.filename);
  const contentType = validateContentType(body.contentType);
  if (!filename) {
    return jsonError(
      c,
      "Invalid filename (alphanumeric, dot, dash, underscore only)",
      "INVALID_FILENAME"
    );
  }
  if (!contentType) {
    return jsonError(
      c,
      "Invalid contentType (see allowed types in README)",
      "INVALID_CONTENT_TYPE"
    );
  }

  const key = `uploads/${crypto.randomUUID()}-${filename}`;

  try {
    const uploadUrl = await createPresignedPutUrl(c.env, key, contentType);
    const response: PresignResponse = {
      uploadUrl,
      key,
      contentType,
      maxBytes: MAX_FILE_BYTES,
      expiresInSeconds: PRESIGN_TTL_SECONDS,
    };
    return jsonSuccess(c, response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Presign failed";
    return jsonError(c, message, "PRESIGN_ERROR", 502);
  }
});

export default app;
