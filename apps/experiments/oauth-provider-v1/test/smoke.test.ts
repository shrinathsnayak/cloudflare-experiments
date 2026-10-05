import { describe, it, expect, vi } from "vitest";

// Mock the OAuth provider package
vi.mock("@cloudflare/workers-oauth-provider", () => ({
  AuthorizationServer: vi.fn().mockImplementation(() => ({
    fetch: vi.fn().mockResolvedValue(new Response("auth")),
  })),
  ResourceServer: vi.fn().mockImplementation(() => ({
    fetch: vi.fn().mockResolvedValue(new Response("resource")),
  })),
}));

describe("smoke", () => {
  it("GET / returns 200 with app info", async () => {
    const { default: worker } = await import("../src/index");
    const mockKV = {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    };

    const res = await worker.fetch(
      new Request("http://localhost/"),
      { OAUTH_KV: mockKV } as any,
      {} as any
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name?: string; description?: string };
    expect(body.name).toBe("oauth-provider-v1");
    expect(body.description).toBeDefined();
  });
});
