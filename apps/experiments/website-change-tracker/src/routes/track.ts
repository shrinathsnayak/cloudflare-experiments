import { Hono } from "hono";
import type { Env } from "../types/env";
import type { TrackRequestBody, TrackResponse } from "../types/track";
import { validateUrl } from "../lib/url";
import {
  getSnapshotHistory,
  getTrackedUrl,
  registerTrackedUrl,
  unregisterTrackedUrl,
} from "../lib/track";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/track", async (c) => {
  let body: TrackRequestBody;
  try {
    body = (await c.req.json()) as TrackRequestBody;
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }

  const url = validateUrl(body.url);
  if (!url) {
    return jsonError(c, "Missing or invalid body field: url (http or https only)", "INVALID_URL");
  }

  const existing = await getTrackedUrl(c.env.DB, url);
  if (existing) {
    return jsonSuccess(c, {
      url: existing.url,
      id: existing.id,
      createdAt: new Date(existing.created_at * 1000).toISOString(),
    } satisfies TrackResponse);
  }

  try {
    const tracked = await registerTrackedUrl(c.env.DB, url);
    return jsonSuccess(
      c,
      {
        url: tracked.url,
        id: tracked.id,
        createdAt: new Date(tracked.created_at * 1000).toISOString(),
      } satisfies TrackResponse,
      201
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to register URL";
    if (message.includes("UNIQUE constraint")) {
      const tracked = await getTrackedUrl(c.env.DB, url);
      if (tracked) {
        return jsonSuccess(c, {
          url: tracked.url,
          id: tracked.id,
          createdAt: new Date(tracked.created_at * 1000).toISOString(),
        } satisfies TrackResponse);
      }
    }
    throw error;
  }
});

app.delete("/track", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  const removed = await unregisterTrackedUrl(c.env.DB, url);
  if (!removed) {
    return jsonError(c, "Tracked URL not found", "NOT_FOUND", 404);
  }

  return jsonSuccess(c, { url, removed: true });
});

app.get("/history", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  const history = await getSnapshotHistory(c.env.DB, url);
  if (!history) {
    return jsonError(c, "Tracked URL not found", "NOT_FOUND", 404);
  }

  return jsonSuccess(c, history);
});

export default app;
