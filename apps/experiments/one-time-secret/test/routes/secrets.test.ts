import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({
  DurableObject: class {
    constructor(
      readonly ctx: unknown,
      readonly env: unknown
    ) {}
  },
}));

const { default: worker } = await import("../../src/index");
const { createFakeNamespace } = await import("../helpers/fake-namespace");

type ErrorBody = { error: string; code: string };
type Created = { id: string; key: string; url: string; expiresAt: string };

let env: { SECRETS: ReturnType<typeof createFakeNamespace> };

beforeEach(() => {
  env = { SECRETS: createFakeNamespace() };
});

function request(path: string, init?: { method?: string; body?: unknown }) {
  return worker.fetch(
    new Request(`https://secrets.example.com${path}`, {
      method: init?.method ?? "GET",
      headers: { "Content-Type": "application/json" },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    }),
    env
  );
}

async function create(body: unknown = { secret: "hunter2" }): Promise<Created> {
  const res = await request("/secrets", { method: "POST", body });
  expect(res.status).toBe(201);
  return (await res.json()) as Created;
}

describe("POST /secrets", () => {
  it("returns id, key, share url, and expiry", async () => {
    const before = Date.now();
    const created = await create({ secret: "hunter2", ttlSeconds: 3600 });
    expect(created.url).toBe(`https://secrets.example.com/s/${created.id}#${created.key}`);
    const expires = Date.parse(created.expiresAt);
    expect(expires).toBeGreaterThanOrEqual(before + 3600_000);
    expect(expires).toBeLessThanOrEqual(Date.now() + 3600_000);
  });

  it.each([
    [{}, "INVALID_SECRET"],
    [{ secret: "x".repeat(10_001) }, "INVALID_SECRET"],
    [{ secret: "x", ttlSeconds: 10 }, "INVALID_TTL"],
    [{ secret: "x", ttlSeconds: 604_801 }, "INVALID_TTL"],
  ])("rejects %j with %s", async (body, code) => {
    const res = await request("/secrets", { method: "POST", body });
    expect(res.status).toBe(400);
    expect(((await res.json()) as ErrorBody).code).toBe(code);
  });

  it("rejects invalid JSON", async () => {
    const res = await worker.fetch(
      new Request("https://secrets.example.com/secrets", { method: "POST", body: "nope" }),
      env
    );
    expect(((await res.json()) as ErrorBody).code).toBe("INVALID_BODY");
  });
});

describe("GET /secrets/:id", () => {
  it("reports existence without revealing", async () => {
    const { id, expiresAt } = await create();
    const res = await request(`/secrets/${id}`);
    expect(await res.json()).toEqual({ id, exists: true, expiresAt });
  });

  it("rejects malformed ids", async () => {
    const res = await request("/secrets/not-valid");
    expect(res.status).toBe(400);
    expect(((await res.json()) as ErrorBody).code).toBe("INVALID_ID");
  });
});

describe("POST /secrets/:id/reveal", () => {
  it("reveals once, then 404s", async () => {
    const { id, key } = await create();
    const first = await request(`/secrets/${id}/reveal`, { method: "POST", body: { key } });
    expect(first.status).toBe(200);
    expect(first.headers.get("Cache-Control")).toBe("no-store");
    expect(await first.json()).toEqual({ secret: "hunter2" });

    const second = await request(`/secrets/${id}/reveal`, { method: "POST", body: { key } });
    expect(second.status).toBe(404);
    expect(((await second.json()) as ErrorBody).code).toBe("NOT_FOUND");
  });

  it("wrong key returns INVALID_KEY and keeps the secret", async () => {
    const { id, key } = await create();
    const other = await create({ secret: "other" });

    const wrong = await request(`/secrets/${id}/reveal`, {
      method: "POST",
      body: { key: other.key },
    });
    expect(wrong.status).toBe(400);
    expect(((await wrong.json()) as ErrorBody).code).toBe("INVALID_KEY");

    const right = await request(`/secrets/${id}/reveal`, { method: "POST", body: { key } });
    expect(right.status).toBe(200);
  });

  it("rejects a malformed key without calling the vault", async () => {
    const { id } = await create();
    const res = await request(`/secrets/${id}/reveal`, { method: "POST", body: { key: "short" } });
    expect(((await res.json()) as ErrorBody).code).toBe("INVALID_KEY");
  });

  it("404s for an unknown id", async () => {
    const { key } = await create();
    const res = await request(`/secrets/${"A".repeat(22)}/reveal`, {
      method: "POST",
      body: { key },
    });
    expect(res.status).toBe(404);
  });
});

describe("GET /s/:id", () => {
  it("serves the reveal page without burning the secret", async () => {
    const { id } = await create();
    const res = await request(`/s/${id}`);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/html");
    expect(res.headers.get("Content-Security-Policy")).toContain("script-src 'nonce-");
    expect(await res.text()).toContain(JSON.stringify(id));

    const status = await request(`/secrets/${id}`);
    expect(((await status.json()) as { exists: boolean }).exists).toBe(true);
  });

  it("404s for malformed ids", async () => {
    const res = await request("/s/<script>");
    expect(res.status).toBe(404);
  });
});
