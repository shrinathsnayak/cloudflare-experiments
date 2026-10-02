import { Hono } from "hono";
import type { Env } from "../types/env";
import type { ItemResponse, ItemRow } from "../types/digest";
import { listItems } from "../lib/store";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

function toIso(seconds: number | null): string | null {
  return seconds === null ? null : new Date(seconds * 1000).toISOString();
}

function toItemResponse(row: ItemRow): ItemResponse {
  return {
    id: row.id,
    from: row.from_address,
    fromName: row.from_name,
    subject: row.subject,
    summary: row.summary,
    link: row.link,
    receivedAt: toIso(row.received_at) ?? "",
    digestedAt: toIso(row.digested_at),
  };
}

app.get("/items", async (c) => {
  const pending = c.req.query("pending");
  if (pending !== undefined && pending !== "true" && pending !== "false") {
    return jsonError(c, "Query parameter pending must be true or false", "INVALID_QUERY");
  }

  const rows = await listItems(c.env.DB, pending === "true");
  return jsonSuccess(c, { count: rows.length, items: rows.map(toItemResponse) });
});

export default app;
