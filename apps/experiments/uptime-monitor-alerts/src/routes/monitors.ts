import { Hono } from "hono";
import type { Env } from "../types/env";
import type { CreateMonitorBody, MonitorResponse } from "../types/monitor";
import { parseMonitorId, validateEmail, validateUrl } from "../lib/url";
import { createMonitor, deleteMonitor, getMonitor, getMonitorHistory } from "../lib/monitor";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

function toMonitorResponse(monitor: {
  id: number;
  url: string;
  alert_email: string;
  last_status: string | null;
  created_at: number;
}): MonitorResponse {
  return {
    id: monitor.id,
    url: monitor.url,
    alertEmail: monitor.alert_email,
    lastStatus:
      monitor.last_status === "up" || monitor.last_status === "down" ? monitor.last_status : null,
    createdAt: new Date(monitor.created_at * 1000).toISOString(),
  };
}

app.post("/monitors", async (c) => {
  let body: CreateMonitorBody;
  try {
    body = (await c.req.json()) as CreateMonitorBody;
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }

  const url = validateUrl(body.url);
  if (!url) {
    return jsonError(c, "Missing or invalid body field: url (http or https only)", "INVALID_URL");
  }

  const alertEmail = validateEmail(body.alertEmail);
  if (!alertEmail) {
    return jsonError(c, "Missing or invalid body field: alertEmail", "INVALID_EMAIL");
  }

  const monitor = await createMonitor(c.env.DB, url, alertEmail);
  return jsonSuccess(c, toMonitorResponse(monitor), 201);
});

app.delete("/monitors/:id", async (c) => {
  const id = parseMonitorId(c.req.param("id"));
  if (!id) {
    return jsonError(c, "Missing or invalid monitor id", "INVALID_ID");
  }

  const removed = await deleteMonitor(c.env.DB, id);
  if (!removed) {
    return jsonError(c, "Monitor not found", "NOT_FOUND", 404);
  }

  return jsonSuccess(c, { id, removed: true });
});

app.get("/monitors/:id/history", async (c) => {
  const id = parseMonitorId(c.req.param("id"));
  if (!id) {
    return jsonError(c, "Missing or invalid monitor id", "INVALID_ID");
  }

  const monitor = await getMonitor(c.env.DB, id);
  if (!monitor) {
    return jsonError(c, "Monitor not found", "NOT_FOUND", 404);
  }

  const history = await getMonitorHistory(c.env.DB, id);
  if (!history) {
    return jsonError(c, "Monitor not found", "NOT_FOUND", 404);
  }

  return jsonSuccess(c, history);
});

export default app;
