import {
  MAX_CONTENT_LENGTH,
  MAX_NOTE_ID_LENGTH,
  NOTE_ID_PATTERN,
  NOTE_KEY_PREFIX,
} from "../constants/defaults";

export function validateNoteId(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_NOTE_ID_LENGTH) return null;
  if (!NOTE_ID_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function validateContent(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_CONTENT_LENGTH) return null;
  return trimmed;
}

export function noteKey(id: string): string {
  return `${NOTE_KEY_PREFIX}${id}`;
}

export async function getNote(kv: KVNamespace, id: string): Promise<string | null> {
  return kv.get(noteKey(id));
}

export async function saveNote(kv: KVNamespace, id: string, content: string): Promise<void> {
  const record = {
    id,
    content,
    updatedAt: new Date().toISOString(),
  };
  await kv.put(noteKey(id), JSON.stringify(record));
}

export async function deleteNote(kv: KVNamespace, id: string): Promise<void> {
  await kv.delete(noteKey(id));
}

export function parseNoteRecord(
  raw: string,
  id: string
): { id: string; content: string; updatedAt: string } | null {
  try {
    const parsed = JSON.parse(raw) as { id?: string; content?: string; updatedAt?: string };
    if (!parsed.content || typeof parsed.content !== "string") return null;
    return {
      id: parsed.id ?? id,
      content: parsed.content,
      updatedAt: parsed.updatedAt ?? new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}
