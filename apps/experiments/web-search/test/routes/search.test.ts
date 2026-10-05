import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ([
    {
      url: "https://example.com",
      title: "Test Result",
      snippet: "Test snippet",
    },
  ]),
} as any);

describe("POST /search", () => {
  it("returns 400 when body is invalid JSON", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/search", {
        method: "POST",
        body: "not json",
      }),
      {} as any
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe("INVALID_JSON");
  });

  it("returns 400 when query is missing", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/search", {
        method: "POST",
        body: JSON.stringify({ provider: "ceramic" }),
      }),
      {} as any
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe("INVALID_REQUEST");
  });

  it("returns 400 when provider is invalid", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/search", {
        method: "POST",
        body: JSON.stringify({ query: "test", provider: "invalid" }),
      }),
      {} as any
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe("INVALID_PROVIDER");
  });

  it("returns 200 with search results when valid", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/search", {
        method: "POST",
        body: JSON.stringify({ query: "cloudflare workers" }),
      }),
      {} as any
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      query: string;
      provider: string;
      limit: number;
      results: any[];
    };
    expect(body.query).toBe("cloudflare workers");
    expect(body.provider).toBe("ceramic");
    expect(body.limit).toBe(5);
  });
});
