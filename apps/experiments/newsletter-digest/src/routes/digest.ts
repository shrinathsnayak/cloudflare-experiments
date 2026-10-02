import { Hono } from "hono";
import type { Env } from "../types/env";
import { isAdmin } from "../lib/auth";
import { previewDigest, sendDigest } from "../lib/digest";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/digest/preview", async (c) => {
  return jsonSuccess(c, await previewDigest(c.env));
});

app.post("/digest/send", async (c) => {
  if (!(await isAdmin(c.req.header("Authorization"), c.env.ADMIN_TOKEN))) {
    return jsonError(c, "Missing or invalid admin bearer token", "UNAUTHORIZED", 401);
  }
  if (!c.env.DIGEST_TO?.trim()) {
    return jsonError(c, "DIGEST_TO is not configured", "MISSING_CONFIG");
  }

  try {
    return jsonSuccess(c, await sendDigest(c.env));
  } catch (error) {
    console.error("Digest send failed", error);
    return jsonError(c, "Failed to send digest email", "SEND_ERROR", 502);
  }
});

export default app;
