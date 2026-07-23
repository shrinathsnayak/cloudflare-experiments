import { describe, it, expect, vi } from "vitest";
import inboxRoutes from "../../src/routes/inbox";

describe("inbox routes", () => {
  it("lists messages from KV", async () => {
    const msg = {
      id: "abc",
      from: "a@example.com",
      to: "inbox@example.com",
      subject: "Hi",
      receivedAt: "2024-01-01T00:00:00.000Z",
      rejected: false,
    };
    const kv = {
      get: vi.fn(async (key: string) => {
        if (key === "inbox:index") return ["abc"];
        if (key === "inbox:msg:abc") return msg;
        return null;
      }),
    } as unknown as KVNamespace;

    const res = await inboxRoutes.fetch(new Request("http://localhost/inbox"), {
      INBOX: kv,
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { count: number; messages: unknown[] };
    expect(body.count).toBe(1);
    expect(body.messages).toHaveLength(1);
  });

  it("returns 404 for missing message", async () => {
    const kv = {
      get: vi.fn().mockResolvedValue(null),
    } as unknown as KVNamespace;

    const res = await inboxRoutes.fetch(new Request("http://localhost/inbox/missing"), {
      INBOX: kv,
    });
    expect(res.status).toBe(404);
  });
});
