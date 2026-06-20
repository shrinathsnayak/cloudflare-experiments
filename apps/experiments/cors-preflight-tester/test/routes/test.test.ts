import { describe, it, expect, vi, beforeEach } from "vitest";
import worker from "../../src/index";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("POST /test", () => {
  it("returns 400 for invalid body", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://api.example.com" }),
      })
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("INVALID_BODY");
  });

  it("reports cors header checks", async () => {
    fetchMock.mockResolvedValue(
      new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "https://app.example.com",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "authorization, content-type",
        },
      })
    );

    const res = await worker.fetch(
      new Request("http://localhost/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://api.example.com/resource",
          origin: "https://app.example.com",
          method: "POST",
          headers: ["Authorization"],
        }),
      })
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { valid: boolean; checks: Array<{ status: string }> };
    expect(body.valid).toBe(true);
    expect(body.checks.some((check) => check.status === "ok")).toBe(true);
  });
});
