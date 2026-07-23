import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

vi.mock("../../src/lib/check", () => ({
  fetchPageHtml: vi.fn().mockResolvedValue({
    ok: true,
    url: "https://example.com/",
    html: '<a href="https://example.com/ok">ok</a><a href="https://example.com/missing">missing</a>',
  }),
  checkBrokenLinks: vi.fn().mockResolvedValue({
    url: "https://example.com/",
    checked: 2,
    broken: 1,
    links: [
      { href: "https://example.com/ok", statusCode: 200, ok: true },
      { href: "https://example.com/missing", statusCode: 404, ok: false },
    ],
  }),
}));

describe("GET /check", () => {
  it("returns 400 when url is missing", async () => {
    const res = await worker.fetch(new Request("http://localhost/check"));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("INVALID_URL");
  });

  it("returns link check results", async () => {
    const res = await worker.fetch(new Request("http://localhost/check?url=https://example.com"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { checked: number; broken: number };
    expect(body.checked).toBe(2);
    expect(body.broken).toBe(1);
  });
});
