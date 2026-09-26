import { Hono } from "hono";
import type { Env } from "../types/env";
import type { SaveNoteRequest } from "../types/note";
import {
  deleteNote,
  getNote,
  listNotes,
  upsertNote,
  validateContent,
  validateId,
} from "../lib/notes";
import { jsonError, jsonSuccess } from "../utils/response";

const notesRoutes = new Hono<{ Bindings: Env }>();

notesRoutes.get("/notes", async (c) => {
  const userId = validateId(c.req.query("userId"));
  if (!userId) {
    return jsonError(c, "Missing or invalid query parameter: userId", "INVALID_USER_ID");
  }

  const noteId = c.req.query("id");
  if (noteId !== undefined && noteId !== "") {
    const id = validateId(noteId);
    if (!id) {
      return jsonError(c, "Missing or invalid query parameter: id", "INVALID_ID");
    }
    const note = await getNote(c.env, userId, id);
    if (!note) {
      return jsonError(c, "Note not found", "NOT_FOUND", 404);
    }
    return jsonSuccess(c, note);
  }

  const notes = await listNotes(c.env, userId);
  return jsonSuccess(c, { userId, notes });
});

notesRoutes.post("/notes", async (c) => {
  let body: SaveNoteRequest;
  try {
    body = await c.req.json<SaveNoteRequest>();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_BODY");
  }

  const userId = validateId(body.userId);
  const id = validateId(body.id);
  const content = validateContent(body.content);

  if (!userId) {
    return jsonError(c, "Missing or invalid field: userId", "INVALID_USER_ID");
  }
  if (!id) {
    return jsonError(c, "Missing or invalid field: id", "INVALID_ID");
  }
  if (!content) {
    return jsonError(c, "Missing or invalid field: content (max 4000 chars)", "INVALID_CONTENT");
  }

  const note = await upsertNote(c.env, userId, id, content);
  return jsonSuccess(c, { userId, ...note });
});

notesRoutes.delete("/notes", async (c) => {
  const userId = validateId(c.req.query("userId"));
  const id = validateId(c.req.query("id"));

  if (!userId) {
    return jsonError(c, "Missing or invalid query parameter: userId", "INVALID_USER_ID");
  }
  if (!id) {
    return jsonError(c, "Missing or invalid query parameter: id", "INVALID_ID");
  }

  const deleted = await deleteNote(c.env, userId, id);
  if (!deleted) {
    return jsonError(c, "Note not found", "NOT_FOUND", 404);
  }
  return jsonSuccess(c, { userId, id, deleted: true });
});

export default notesRoutes;
