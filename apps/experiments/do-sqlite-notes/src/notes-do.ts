import type { NoteRecord } from "./types/note";

type NoteRow = {
  id: string;
  content: string;
  updated_at: string;
};

export class NotesDO implements DurableObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.state.blockConcurrencyWhile(async () => {
      this.state.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    if (method === "POST" && url.pathname === "/notes") {
      const body = (await request.json()) as { id?: string; content?: string };
      if (!body.id || !body.content) {
        return Response.json(
          { error: "Missing id or content", code: "INVALID_BODY" },
          { status: 400 }
        );
      }
      const updatedAt = new Date().toISOString();
      this.state.storage.sql.exec(
        `INSERT INTO notes (id, content, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`,
        body.id,
        body.content,
        updatedAt
      );
      const note: NoteRecord = { id: body.id, content: body.content, updatedAt };
      return Response.json(note);
    }

    if (method === "GET" && url.pathname === "/notes") {
      const id = url.searchParams.get("id");
      if (id) {
        const rows = this.state.storage.sql
          .exec<NoteRow>("SELECT id, content, updated_at FROM notes WHERE id = ?", id)
          .toArray();
        if (rows.length === 0) {
          return Response.json({ error: "Note not found", code: "NOT_FOUND" }, { status: 404 });
        }
        const row = rows[0];
        return Response.json({
          id: row.id,
          content: row.content,
          updatedAt: row.updated_at,
        } satisfies NoteRecord);
      }

      const rows = this.state.storage.sql
        .exec<NoteRow>("SELECT id, content, updated_at FROM notes ORDER BY updated_at DESC")
        .toArray();
      const notes: NoteRecord[] = rows.map((row) => ({
        id: row.id,
        content: row.content,
        updatedAt: row.updated_at,
      }));
      return Response.json({ notes });
    }

    if (method === "DELETE" && url.pathname === "/notes") {
      const id = url.searchParams.get("id");
      if (!id) {
        return Response.json({ error: "Missing id", code: "INVALID_ID" }, { status: 400 });
      }
      const existing = this.state.storage.sql
        .exec<NoteRow>("SELECT id FROM notes WHERE id = ?", id)
        .toArray();
      if (existing.length === 0) {
        return Response.json({ error: "Note not found", code: "NOT_FOUND" }, { status: 404 });
      }
      this.state.storage.sql.exec("DELETE FROM notes WHERE id = ?", id);
      return Response.json({ id, deleted: true });
    }

    return Response.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
  }
}
