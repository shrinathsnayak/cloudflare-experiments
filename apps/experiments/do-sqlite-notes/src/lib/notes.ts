import { ID_PATTERN, MAX_CONTENT_LENGTH, MAX_ID_LENGTH } from "../constants/defaults";
import type { Env } from "../types/env";
import type { NoteRecord } from "../types/note";

export function validateId(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_ID_LENGTH) return null;
  if (!ID_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function validateContent(input: string | undefined): string | null {
  if (typeof input !== "string") return null;
  if (!input || input.length > MAX_CONTENT_LENGTH) return null;
  return input;
}

export function getNotesStub(env: Env, userId: string): DurableObjectStub {
  const id = env.NOTES.idFromName(userId);
  return env.NOTES.get(id);
}

export async function upsertNote(
  env: Env,
  userId: string,
  noteId: string,
  content: string
): Promise<NoteRecord> {
  const stub = getNotesStub(env, userId);
  const response = await stub.fetch("https://notes/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: noteId, content }),
  });
  if (!response.ok) {
    throw new Error(`Upsert failed with status ${response.status}`);
  }
  return (await response.json()) as NoteRecord;
}

export async function getNote(
  env: Env,
  userId: string,
  noteId: string
): Promise<NoteRecord | null> {
  const stub = getNotesStub(env, userId);
  const response = await stub.fetch(`https://notes/notes?id=${encodeURIComponent(noteId)}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Get failed with status ${response.status}`);
  }
  return (await response.json()) as NoteRecord;
}

export async function listNotes(env: Env, userId: string): Promise<NoteRecord[]> {
  const stub = getNotesStub(env, userId);
  const response = await stub.fetch("https://notes/notes");
  if (!response.ok) {
    throw new Error(`List failed with status ${response.status}`);
  }
  const body = (await response.json()) as { notes: NoteRecord[] };
  return body.notes;
}

export async function deleteNote(env: Env, userId: string, noteId: string): Promise<boolean> {
  const stub = getNotesStub(env, userId);
  const response = await stub.fetch(`https://notes/notes?id=${encodeURIComponent(noteId)}`, {
    method: "DELETE",
  });
  if (response.status === 404) return false;
  if (!response.ok) {
    throw new Error(`Delete failed with status ${response.status}`);
  }
  return true;
}
