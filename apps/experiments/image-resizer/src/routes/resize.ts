import { Hono } from "hono";
import type { Env } from "../types/env";
import { FETCH_TIMEOUT_MS } from "../constants/defaults";
import { validateUrl } from "../lib/url";
import { buildImageOptions, normalizeFit, parseDimension } from "../lib/resize";
import { jsonError } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/resize", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  const widthParam = c.req.query("width");
  const heightParam = c.req.query("height");
  const width = parseDimension(widthParam);
  const height = parseDimension(heightParam);

  if (widthParam !== undefined && width === null) {
    return jsonError(c, "Invalid query parameter: width", "INVALID_WIDTH");
  }
  if (heightParam !== undefined && height === null) {
    return jsonError(c, "Invalid query parameter: height", "INVALID_HEIGHT");
  }
  if (width === null && height === null) {
    return jsonError(
      c,
      "Missing query parameter: width or height is required",
      "MISSING_DIMENSION"
    );
  }

  const fit = normalizeFit(c.req.query("fit"));
  if (!fit) {
    return jsonError(c, "Invalid query parameter: fit", "INVALID_FIT");
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      cf: { image: buildImageOptions(width, height, fit) },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return jsonError(c, "Failed to fetch or resize image", "FETCH_ERROR", 502);
    }

    const contentType = response.headers.get("content-type") ?? "application/octet-stream";
    const body = await response.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch or resize image";
    return jsonError(c, message, "FETCH_ERROR", 502);
  }
});

export default app;
