import { Hono } from "hono";
import type { Env } from "../types/env";
import type { ListResponse } from "../types/r2";
import { getBucket } from "../lib/bucket";
import { jsonError, jsonSuccess } from "../utils/response";
import { LIST_MAX_KEYS } from "../constants/defaults";

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /list
 * Query: public (optional), prefix (optional), limit (optional), cursor (optional), delimiter (optional)
 * Use public=true to list from the public bucket.
 */
app.get("/list", async (c) => {
  const bucket = getBucket(c.env, c.req.query("public"));
  const prefix = c.req.query("prefix") ?? undefined;
  const rawLimit = c.req.query("limit");
  const cursor = c.req.query("cursor") ?? undefined;
  const delimiter = c.req.query("delimiter") ?? undefined;

  let limit: number | undefined;
  if (rawLimit !== undefined) {
    const n = parseInt(rawLimit, 10);
    if (Number.isNaN(n) || n < 1 || n > LIST_MAX_KEYS) {
      return jsonError(c, `limit must be between 1 and ${LIST_MAX_KEYS}`, "INVALID_QUERY", 400);
    }
    limit = n;
  }

  const listOptions: R2ListOptions = {
    prefix,
    limit,
    cursor,
    delimiter: delimiter || undefined,
  };

  const result = await bucket.list(listOptions);

  const response: ListResponse = {
    objects: result.objects.map((o) => ({
      key: o.key,
      size: o.size,
      etag: o.etag,
      uploaded: o.uploaded.toISOString(),
      ...(o.customMetadata &&
        Object.keys(o.customMetadata).length > 0 && { customMetadata: o.customMetadata }),
    })),
    truncated: result.truncated,
    ...(result.truncated && result.cursor && { cursor: result.cursor }),
  };

  return jsonSuccess(c, response);
});

export default app;
