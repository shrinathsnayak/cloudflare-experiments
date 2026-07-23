import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

vi.mock("../../src/lib/fetch", () => ({
  fetchResponseHeaders: vi.fn().mockResolvedValue({
    ok: true,
    url: "https://cloudflare.com/",
    headers: {
      "strict-transport-security": "max-age=31536000",
      "x-content-type-options": "nosniff",
    },
    method: "HEAD",
  }),
}));

describe("GET /grade", () => {
  it("returns 400 when url is missing", async () => {
    const res = await worker.fetch(new Request("http://localhost/grade"));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("INVALID_URL");
  });

  it("returns 400 when url is invalid", async () => {
    const res = await worker.fetch(new Request("http://localhost/grade?url=ftp://example.com"));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("INVALID_URL");
  });

  it("returns 200 with grade payload when url is valid", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/grade?url=https://cloudflare.com")
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      url: string;
      score: number;
      grade: string;
      checks: unknown[];
    };
    expect(body.url).toBe("https://cloudflare.com/");
    expect(typeof body.score).toBe("number");
    expect(body.grade).toBeTruthy();
    expect(Array.isArray(body.checks)).toBe(true);
  });
});
