import { Hono } from "hono";
import type { Env } from "../types/env";
import type { HeadResponse } from "../types/r2";
import { getBucket, getPublicUrl, isPublicParam } from "../lib/bucket";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

function getKey(c: { req: { query: (x: string) => string | undefined } }): string | null {
  const key = c.req.query("key");
  if (!key || typeof key !== "string" || !key.trim()) return null;
  return key.trim();
}

/**
 * GET /object?key=<key>&public=
 * Use public=true to get from the public bucket. Otherwise private (Worker-only access).
 */
app.get("/object", async (c) => {
  const key = getKey(c);
  if (!key) {
    return jsonError(c, "Missing or invalid query parameter: key", "INVALID_QUERY", 400);
  }

  const bucket = getBucket(c.env, c.req.query("public"));
  const isHead = c.req.method === "HEAD";

  if (isHead) {
    const object = await bucket.head(key);
    if (!object) {
      return new Response(null, { status: 404 });
    }
    const response: HeadResponse = {
      key,
      size: object.size,
      etag: object.etag,
      uploaded: object.uploaded.toISOString(),
      ...(object.customMetadata && Object.keys(object.customMetadata).length > 0 && { customMetadata: object.customMetadata }),
      ...(object.httpMetadata && { httpMetadata: object.httpMetadata }),
    };
    return jsonSuccess(c, response);
  }

  const range = c.req.raw.headers.get("Range") ?? undefined;
  const object = await bucket.get(key, { range: range || undefined });

  if (!object) {
    return jsonError(c, "Object not found", "NOT_FOUND", 404);
  }

  const headers = new Headers();
  if (object.httpMetadata?.contentType) {
    headers.set("Content-Type", object.httpMetadata.contentType);
  }
  if (object.etag) {
    headers.set("ETag", object.etag);
  }
  if (object.size !== undefined) {
    headers.set("Content-Length", String(object.size));
  }

  return new Response(object.body, { status: 200, headers });
});

/**
 * PUT /object?key=<key>&public=
 * Use public=true to upload to the public bucket (then object is reachable at PUBLIC_BUCKET_URL/key).
 * Otherwise uploads to the private bucket (only via GET /object?key=...).
 * Body: raw bytes. Optional headers: Content-Type, X-Custom-Metadata-*.
 */
app.put("/object", async (c) => {
  const key = getKey(c);
  if (!key) {
    return jsonError(c, "Missing or invalid query parameter: key", "INVALID_QUERY", 400);
  }

  const usePublic = isPublicParam(c.req.query("public"));
  const bucket = getBucket(c.env, c.req.query("public"));
  const body = c.req.raw.body;
  if (!body) {
    return jsonError(c, "Request body is required", "MISSING_PARAM", 400);
  }

  const contentType = c.req.raw.headers.get("Content-Type") ?? undefined;
  const customMetadata: Record<string, string> = {};
  c.req.raw.headers.forEach((value, name) => {
    if (name.toLowerCase().startsWith("x-custom-metadata-")) {
      const metaKey = name.slice("x-custom-metadata-".length).replace(/-/g, "_");
      customMetadata[metaKey] = value;
    }
  });

  const httpMetadata: R2HTTPMetadata = contentType ? { contentType } : {};
  await bucket.put(key, body, {
    httpMetadata: Object.keys(httpMetadata).length ? httpMetadata : undefined,
    customMetadata: Object.keys(customMetadata).length ? customMetadata : undefined,
  });

  const url = getPublicUrl(c.env, key, usePublic);
  return jsonSuccess(c, { key, uploaded: true, ...(url && { url }) });
});

/**
 * DELETE /object?key=<key>&public=
 * Use public=true to delete from the public bucket.
 */
app.delete("/object", async (c) => {
  const key = getKey(c);
  if (!key) {
    return jsonError(c, "Missing or invalid query parameter: key", "INVALID_QUERY", 400);
  }

  const bucket = getBucket(c.env, c.req.query("public"));
  await bucket.delete(key);

  return jsonSuccess(c, { key, deleted: true });
});

export default app;
