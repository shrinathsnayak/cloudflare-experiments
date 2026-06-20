import { Hono } from "hono";
import type { Env } from "../types/env";
import type {
  CaptureResponse,
  CapturedRequest,
  CapturedRequestSummary,
  NewRelayResponse,
} from "../types/relay";
import { buildInboundUrl, validateRelayId } from "../lib/capture";
import { getRelayStub } from "../lib/relay";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/relay/new", async (c) => {
  const id = crypto.randomUUID();
  const stub = getRelayStub(c.env.RELAY, id);
  const initResponse = await stub.fetch("https://relay/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  if (!initResponse.ok) {
    return jsonError(c, "Failed to create relay session", "RELAY_CREATE_ERROR", 502);
  }

  const inboundUrl = buildInboundUrl(new URL(c.req.url).origin, id);
  const payload: NewRelayResponse = { id, inboundUrl };
  return jsonSuccess(c, payload, 201);
});

app.get("/relay/:id/requests/:requestId", async (c) => {
  const id = validateRelayId(c.req.param("id"));
  const requestId = c.req.param("requestId")?.trim();
  if (!id) {
    return jsonError(c, "Invalid relay id", "INVALID_ID");
  }
  if (!requestId) {
    return jsonError(c, "Missing request id", "INVALID_REQUEST_ID");
  }

  const stub = getRelayStub(c.env.RELAY, id);
  const response = await stub.fetch(`https://relay/requests/${requestId}`);
  if (response.status === 404) {
    return jsonError(c, "Request not found", "NOT_FOUND", 404);
  }
  if (!response.ok) {
    return jsonError(c, "Failed to load request details", "RELAY_FETCH_ERROR", 502);
  }

  const record = (await response.json()) as CapturedRequest;
  return jsonSuccess(c, record);
});

app.get("/relay/:id/requests", async (c) => {
  const id = validateRelayId(c.req.param("id"));
  if (!id) {
    return jsonError(c, "Invalid relay id", "INVALID_ID");
  }

  const stub = getRelayStub(c.env.RELAY, id);
  const response = await stub.fetch("https://relay/requests");
  if (response.status === 404) {
    return jsonError(c, "Relay session not found", "NOT_FOUND", 404);
  }
  if (!response.ok) {
    return jsonError(c, "Failed to list captured requests", "RELAY_FETCH_ERROR", 502);
  }

  const data = (await response.json()) as {
    id: string;
    requests: CapturedRequestSummary[];
  };
  return jsonSuccess(c, data);
});

app.all("/relay/:id", async (c) => {
  const id = validateRelayId(c.req.param("id"));
  if (!id) {
    return jsonError(c, "Invalid relay id", "INVALID_ID");
  }

  const incoming = c.req.raw;
  const originalUrl = new URL(c.req.url);
  const stub = getRelayStub(c.env.RELAY, id);
  const captureRequest = new Request(`https://relay${originalUrl.pathname}${originalUrl.search}`, {
    method: incoming.method,
    headers: incoming.headers,
    body:
      incoming.method === "GET" || incoming.method === "HEAD"
        ? undefined
        : await incoming.arrayBuffer(),
  });

  const response = await stub.fetch(captureRequest);
  if (response.status === 404) {
    return jsonError(c, "Relay session not found", "NOT_FOUND", 404);
  }
  if (!response.ok) {
    return jsonError(c, "Failed to capture request", "RELAY_CAPTURE_ERROR", 502);
  }

  const data = (await response.json()) as CaptureResponse;
  return jsonSuccess(c, data, 202);
});

export default app;
