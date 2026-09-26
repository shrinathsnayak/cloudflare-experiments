import { describe, it, expect, vi } from "vitest";
import dispatchRoutes from "../../src/routes/dispatch";
import scriptsRoutes from "../../src/routes/scripts";
import customersRoutes from "../../src/routes/customers";

function mockKv(store: Map<string, string> = new Map()) {
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    list: vi.fn(async ({ prefix }: { prefix: string }) => ({
      keys: [...store.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })),
      list_complete: true,
      cacheStatus: null,
    })),
  } as unknown as KVNamespace;
}

describe("dispatch routes", () => {
  it("forwards to DISPATCHER when bound", async () => {
    const fetch = vi.fn(async () => Response.json({ ok: true }));
    const dispatcher = {
      get: vi.fn(() => ({ fetch })),
    };

    const res = await dispatchRoutes.fetch(
      new Request("http://localhost/dispatch/acme", { method: "POST", body: "{}" }),
      { SCRIPTS: mockKv(), DISPATCHER: dispatcher }
    );

    expect(res.status).toBe(200);
    expect(dispatcher.get).toHaveBeenCalledWith("acme");
    expect(await res.json()).toEqual({ ok: true });
  });

  it("returns DISPATCH_ERROR when DISPATCHER.get throws", async () => {
    const dispatcher = {
      get: vi.fn(() => {
        throw new Error("Script not found");
      }),
    };

    const res = await dispatchRoutes.fetch(
      new Request("http://localhost/dispatch/missing", { method: "POST" }),
      { SCRIPTS: mockKv(), DISPATCHER: dispatcher }
    );

    expect(res.status).toBe(502);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("DISPATCH_ERROR");
  });

  it("falls back to KV response when DISPATCHER is absent", async () => {
    const store = new Map<string, string>();
    const kv = mockKv(store);

    await scriptsRoutes.fetch(
      new Request("http://localhost/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "demo", response: { hello: "kv" } }),
      }),
      { SCRIPTS: kv }
    );

    const res = await dispatchRoutes.fetch(
      new Request("http://localhost/dispatch/demo", { method: "POST" }),
      { SCRIPTS: kv }
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ hello: "kv" });
  });
});

describe("customers routes", () => {
  it("registers and lists customers", async () => {
    const kv = mockKv();

    const register = await customersRoutes.fetch(
      new Request("http://localhost/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "acme" }),
      }),
      { SCRIPTS: kv }
    );
    expect(register.status).toBe(200);

    const list = await customersRoutes.fetch(new Request("http://localhost/customers"), {
      SCRIPTS: kv,
    });
    expect(list.status).toBe(200);
    expect(await list.json()).toEqual({ customers: ["acme"] });
  });
});
