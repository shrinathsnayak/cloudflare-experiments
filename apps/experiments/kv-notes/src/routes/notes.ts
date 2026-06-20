import { Hono } from "hono";
import type { Env } from "../types/env";
import type { SaveNoteRequest } from "../types/note";
import {
  deleteNote,
  getNote,
  parseNoteRecord,
  saveNote,
  validateContent,
  validateNoteId,
} from "../lib/note";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/notes", async (c) => {
  const id = validateNoteId(c.req.query("id"));
  if (!id) {
    return jsonError(c, "Missing or invalid query parameter: id", "INVALID_ID");
  }

  const raw = await getNote(c.env.NOTES, id);
  if (!raw) {
    return jsonError(c, "Note not found", "NOT_FOUND", 404);
  }

  const record = parseNoteRecord(raw, id);
  if (!record) {
    return jsonError(c, "Stored note is invalid", "INVALID_NOTE", 502);
  }

  return jsonSuccess(c, record);
});

app.post("/notes", async (c) => {
  let body: SaveNoteRequest;
  try {
    body = await c.req.json<SaveNoteRequest>();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_BODY");
  }

  const id = validateNoteId(body.id);
  const content = validateContent(body.content);
  if (!id) {
    return jsonError(c, "Missing or invalid field: id", "INVALID_ID");
  }
  if (!content) {
    return jsonError(c, "Missing or invalid field: content", "INVALID_CONTENT");
  }

  await saveNote(c.env.NOTES, id, content);
  return jsonSuccess(c, { id, content, updatedAt: new Date().toISOString() });
});

app.delete("/notes", async (c) => {
  const id = validateNoteId(c.req.query("id"));
  if (!id) {
    return jsonError(c, "Missing or invalid query parameter: id", "INVALID_ID");
  }

  const existing = await getNote(c.env.NOTES, id);
  if (!existing) {
    return jsonError(c, "Note not found", "NOT_FOUND", 404);
  }

  await deleteNote(c.env.NOTES, id);
  return jsonSuccess(c, { id, deleted: true });
});

export default app;
