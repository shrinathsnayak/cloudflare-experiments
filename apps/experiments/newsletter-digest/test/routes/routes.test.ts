import { describe, it, expect, vi, beforeEach } from "vitest";
import worker from "../../src/index";
import type { Env } from "../../src/types/env";
import { createMockDb, item } from "../helpers/mock-db";

describe("HTTP routes", () => {
  let db: ReturnType<typeof createMockDb>;
  let send: ReturnType<typeof vi.fn>;
  const env = (overrides: Partial<Env> = {}) =>
    ({
      DB: db,
      EMAIL: { send },
      DIGEST_TO: "me@example.com",
      ADMIN_TOKEN: "admin",
      ...overrides,
    }) as unknown as Env;

  beforeEach(() => {
    db = createMockDb([item({ id: 1 }), item({ id: 2, digested_at: 1_790_000_500 })]);
    send = vi.fn().mockResolvedValue({ messageId: "m1" });
  });

  it("GET /items lists all items", async () => {
    const res = await worker.fetch(new Request("http://localhost/items"), env());
    expect(res.status).toBe(200);
    expect(((await res.json()) as { count: number }).count).toBe(2);
  });

  it("GET /items?pending=true lists undigested items", async () => {
    const res = await worker.fetch(new Request("http://localhost/items?pending=true"), env());
    const body = (await res.json()) as { items: Array<{ id: number; digestedAt: string | null }> };
    expect(body.items).toEqual([expect.objectContaining({ id: 1, digestedAt: null })]);
  });

  it("GET /items validates pending", async () => {
    const res = await worker.fetch(new Request("http://localhost/items?pending=yes"), env());
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe("INVALID_QUERY");
  });

  it("POST /digest/preview returns the digest without sending", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/digest/preview", { method: "POST" }),
      env()
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { itemCount: number; text: string; html: string };
    expect(body.itemCount).toBe(1);
    expect(body.html).toContain("<html>");
    expect(send).not.toHaveBeenCalled();
    expect(db.items[0].digested_at).toBeNull();
  });

  it("POST /digest/send requires the admin token", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/digest/send", { method: "POST" }),
      env()
    );
    expect(res.status).toBe(401);
  });

  it("POST /digest/send sends immediately", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/digest/send", {
        method: "POST",
        headers: { Authorization: "Bearer admin" },
      }),
      env()
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ sent: true, itemCount: 1, messageId: "m1" });
    expect(db.items[0].digested_at).not.toBeNull();
  });

  it("POST /digest/send reports missing config and send errors", async () => {
    const headers = { Authorization: "Bearer admin" };
    let res = await worker.fetch(
      new Request("http://localhost/digest/send", { method: "POST", headers }),
      env({ DIGEST_TO: "" })
    );
    expect(((await res.json()) as { code: string }).code).toBe("MISSING_CONFIG");

    send.mockRejectedValue(new Error("unverified"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    res = await worker.fetch(
      new Request("http://localhost/digest/send", { method: "POST", headers }),
      env()
    );
    expect(res.status).toBe(502);
    expect(((await res.json()) as { code: string }).code).toBe("SEND_ERROR");
  });
});
