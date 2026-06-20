import { describe, it, expect, vi, beforeEach } from "vitest";
import worker from "../../src/index";

describe("GET /redirect-chain", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = originalFetch;
    vi.unstubAllGlobals();
  });

  it("returns 400 when url is missing", async () => {
    const res = await worker.fetch(new Request("http://localhost/redirect-chain"));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe("INVALID_URL");
  });

  it("returns 400 when url is invalid", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/redirect-chain?url=ftp://example.com")
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe("INVALID_URL");
  });

  it("returns chain with single 200 when no redirects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        new Response("ok", {
          status: 200,
          headers: {},
        })
      )
    );

    const res = await worker.fetch(
      new Request("http://localhost/redirect-chain?url=https://cloudflare.com")
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { chain: Array<{ url: string; status: number }> };
    expect(body.chain).toHaveLength(1);
    expect(body.chain[0].url).toBe("https://cloudflare.com/");
    expect(body.chain[0].status).toBe(200);
  });

  it("returns chain with 301 then 200 when one redirect", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response("", {
            status: 301,
            headers: { Location: "https://www.example.com/" },
          })
        )
        .mockResolvedValueOnce(new Response("ok", { status: 200, headers: {} }))
    );

    const res = await worker.fetch(
      new Request("http://localhost/redirect-chain?url=https://cloudflare.com")
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      chain: Array<{ url: string; status: number }>;
    };
    expect(body.chain).toHaveLength(2);
    expect(body.chain[0]).toEqual({ url: "https://cloudflare.com/", status: 301 });
    expect(body.chain[1]).toEqual({
      url: "https://www.example.com/",
      status: 200,
    });
  });
});
