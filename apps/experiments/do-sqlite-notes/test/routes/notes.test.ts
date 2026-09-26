import { describe, it, expect, vi } from "vitest";
import notesRoutes from "../../src/routes/notes";

function mockNotesEnv(handler: (request: Request) => Promise<Response> | Response) {
  const stub = {
    fetch: vi.fn(handler),
  };
  return {
    NOTES: {
      idFromName: vi.fn(() => ({ toString: () => "id" })),
      get: vi.fn(() => stub),
    },
  } as unknown as { NOTES: DurableObjectNamespace };
}

describe("notes routes", () => {
  it("POST /notes upserts via DO stub", async () => {
    const env = mockNotesEnv(async () =>
      Response.json({
        id: "n1",
        content: "hello",
        updatedAt: "2025-01-01T00:00:00.000Z",
      })
    );

    const res = await notesRoutes.fetch(
      new Request("http://localhost/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "u1", id: "n1", content: "hello" }),
      }),
      env
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { userId: string; id: string; content: string };
    expect(body.userId).toBe("u1");
    expect(body.id).toBe("n1");
    expect(body.content).toBe("hello");
  });

  it("GET /notes returns 404 when missing", async () => {
    const env = mockNotesEnv(async () =>
      Response.json({ error: "Note not found", code: "NOT_FOUND" }, { status: 404 })
    );

    const res = await notesRoutes.fetch(
      new Request("http://localhost/notes?userId=u1&id=missing"),
      env
    );

    expect(res.status).toBe(404);
  });

  it("rejects invalid userId", async () => {
    const env = mockNotesEnv(async () => new Response("ok"));
    const res = await notesRoutes.fetch(new Request("http://localhost/notes?userId=bad id"), env);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("INVALID_USER_ID");
  });
});
