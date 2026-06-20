import { describe, it, expect, vi } from "vitest";
import configsRoutes from "../../src/routes/configs";
import mockRoutes from "../../src/routes/mock";

function createKv(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));

  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    delete: vi.fn(async (key: string) => {
      store.delete(key);
    }),
    list: vi.fn(async ({ prefix }: { prefix?: string }) => ({
      keys: [...store.keys()]
        .filter((key) => !prefix || key.startsWith(prefix))
        .map((name) => ({ name })),
      list_complete: true,
    })),
    _store: store,
  } as unknown as KVNamespace & { _store: Map<string, string> };
}

describe("configs routes", () => {
  it("POST /configs stores a mock and returns a slug", async () => {
    const kv = createKv();

    const res = await configsRoutes.fetch(
      new Request("http://localhost/configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: "/health",
          method: "GET",
          status: 200,
          body: { ok: true },
        }),
      }),
      { MOCKS: kv }
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { slug?: string; status?: number };
    expect(body.slug).toHaveLength(8);
    expect(body.status).toBe(200);
    expect(kv.put).toHaveBeenCalled();
  });

  it("DELETE /configs/:slug removes an existing mock", async () => {
    const kv = createKv({
      "mock:testslug": JSON.stringify({
        slug: "testslug",
        path: "/health",
        method: "GET",
        status: 200,
        body: { ok: true },
        createdAt: "2024-01-01T00:00:00.000Z",
      }),
    });

    const res = await configsRoutes.fetch(
      new Request("http://localhost/configs/testslug", {
        method: "DELETE",
      }),
      { MOCKS: kv }
    );

    expect(res.status).toBe(200);
    expect(kv.delete).toHaveBeenCalledWith("mock:testslug");
  });
});

describe("mock routes", () => {
  it("GET /mock/:slug serves the configured JSON body", async () => {
    const kv = createKv({
      "mock:testslug": JSON.stringify({
        slug: "testslug",
        path: "/users/1",
        method: "GET",
        status: 201,
        body: { id: 1 },
        createdAt: "2024-01-01T00:00:00.000Z",
      }),
    });

    const res = await mockRoutes.fetch(new Request("http://localhost/mock/testslug/users/1"), {
      MOCKS: kv,
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as { id?: number };
    expect(body.id).toBe(1);
  });

  it("returns 404 when method does not match", async () => {
    const kv = createKv({
      "mock:testslug": JSON.stringify({
        slug: "testslug",
        path: "/users/1",
        method: "GET",
        status: 200,
        body: { id: 1 },
        createdAt: "2024-01-01T00:00:00.000Z",
      }),
    });

    const res = await mockRoutes.fetch(
      new Request("http://localhost/mock/testslug", { method: "POST" }),
      { MOCKS: kv }
    );

    expect(res.status).toBe(404);
  });
});
