import { Hono } from "hono";
import type { Env } from "../types/env";
import { createR2ArtifactStore, validatePath } from "../lib/artifacts";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/files/list", async (c) => {
  const prefixRaw = c.req.query("prefix");
  let prefix: string | undefined;
  if (prefixRaw !== undefined && prefixRaw !== "") {
    const validated = validatePath(prefixRaw);
    if (!validated) {
      return jsonError(
        c,
        "Invalid query parameter: prefix (max 256, alphanumeric / _ - ., no ..)",
        "INVALID_PATH"
      );
    }
    prefix = validated;
  }

  const store = createR2ArtifactStore(c.env.ARTIFACTS);
  const files = await store.list(prefix);
  return jsonSuccess(c, { files, prefix: prefix ?? "" });
});

app.put("/files", async (c) => {
  const path = validatePath(c.req.query("path"));
  if (!path) {
    return jsonError(
      c,
      "Missing or invalid query parameter: path (max 256, alphanumeric / _ - ., no ..)",
      "INVALID_PATH"
    );
  }

  const body = await c.req.text();
  const store = createR2ArtifactStore(c.env.ARTIFACTS);
  await store.put(path, body);
  return jsonSuccess(c, { path, stored: true });
});

app.get("/files", async (c) => {
  const path = validatePath(c.req.query("path"));
  if (!path) {
    return jsonError(
      c,
      "Missing or invalid query parameter: path (max 256, alphanumeric / _ - ., no ..)",
      "INVALID_PATH"
    );
  }

  const store = createR2ArtifactStore(c.env.ARTIFACTS);
  const stream = await store.get(path);
  if (!stream) {
    return jsonError(c, "File not found", "NOT_FOUND", 404);
  }

  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
});

app.delete("/files", async (c) => {
  const path = validatePath(c.req.query("path"));
  if (!path) {
    return jsonError(
      c,
      "Missing or invalid query parameter: path (max 256, alphanumeric / _ - ., no ..)",
      "INVALID_PATH"
    );
  }

  const store = createR2ArtifactStore(c.env.ARTIFACTS);
  const existing = await store.get(path);
  if (!existing) {
    return jsonError(c, "File not found", "NOT_FOUND", 404);
  }

  await store.delete(path);
  return jsonSuccess(c, { path, deleted: true });
});

export default app;
