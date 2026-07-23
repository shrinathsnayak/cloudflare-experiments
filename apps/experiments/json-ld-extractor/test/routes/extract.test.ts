import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

vi.mock("../../src/lib/fetch", () => ({
  fetchHtml: vi.fn().mockResolvedValue({
    ok: true,
    url: "https://example.com/",
    html: `<script type="application/ld+json">{"@type":"WebPage","name":"Home"}</script>`,
  }),
}));

describe("GET /extract", () => {
  it("returns 400 when url missing", async () => {
    const res = await worker.fetch(new Request("http://localhost/extract"));
    expect(res.status).toBe(400);
  });

  it("returns extracted JSON-LD", async () => {
    const res = await worker.fetch(new Request("http://localhost/extract?url=https://example.com"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { count: number; types: string[] };
    expect(body.count).toBe(1);
    expect(body.types).toContain("WebPage");
  });
});
