import { describe, it, expect, vi } from "vitest";
import notesRoutes from "../../src/routes/notes";

describe("notes routes", () => {
  it("GET /notes returns 404 when note is missing", async () => {
    const kv = {
      get: vi.fn().mockResolvedValue(null),
    } as unknown as KVNamespace;

    const res = await notesRoutes.fetch(new Request("http://localhost/notes?id=missing"), {
      NOTES: kv,
    });

    expect(res.status).toBe(404);
  });
});
