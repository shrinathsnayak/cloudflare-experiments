import { describe, it, expect, vi, afterEach } from "vitest";
import probeRoutes from "../../src/routes/probe";

describe("probe routes", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns latency and status for a valid url", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("ok", { status: 200 }))
    );

    const res = await probeRoutes.fetch(
      new Request("http://localhost/probe?url=https://example.com")
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      url: string;
      status: number;
      latencyMs: number;
      workerPlacement: string;
    };
    expect(body.url).toBe("https://example.com/");
    expect(body.status).toBe(200);
    expect(typeof body.latencyMs).toBe("number");
    expect(body.workerPlacement).toBeDefined();
  });

  it("rejects invalid url", async () => {
    const res = await probeRoutes.fetch(new Request("http://localhost/probe"));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_URL");
  });
});
