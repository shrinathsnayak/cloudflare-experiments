import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

vi.mock("../../src/lib/fetch", () => ({
  fetchWithTiming: vi.fn().mockResolvedValue({
    ok: true,
    statusCode: 200,
    responseTimeMs: 50,
  }),
}));

describe("GET /check", () => {
  it("returns 400 when url is missing", async () => {
    const res = await worker.fetch(new Request("http://localhost/check"));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe("INVALID_URL");
    expect(body.error).toContain("url");
  });

  it("returns 400 when url is invalid", async () => {
    const res = await worker.fetch(new Request("http://localhost/check?url=ftp://example.com"));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe("INVALID_URL");
  });

  it("returns 200 with reachable status when url is valid", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/check?url=https://cloudflare.com")
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      status: string;
      responseTime?: number;
      statusCode?: number;
    };
    expect(body.status).toBe("reachable");
    expect(body.responseTime).toBe(50);
    expect(body.statusCode).toBe(200);
  });
});
