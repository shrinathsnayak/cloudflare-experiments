import { Hono } from "hono";
import type { Env } from "../types/env";
import { getInboxMessage, listInbox } from "../lib/inbox";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/inbox", async (c) => {
  const messages = await listInbox(c.env.INBOX);
  return jsonSuccess(c, { count: messages.length, messages });
});

app.get("/inbox/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) {
    return jsonError(c, "Missing message id", "MISSING_ID");
  }
  const message = await getInboxMessage(c.env.INBOX, id);
  if (!message) {
    return jsonError(c, "Message not found", "NOT_FOUND", 404);
  }
  return jsonSuccess(c, message);
});

export default app;
