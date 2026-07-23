import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

vi.mock("../../src/lib/fetch", () => ({
  fetchFeed: vi.fn().mockResolvedValue({
    ok: true,
    url: "https://example.com/rss.xml",
    body: `<?xml version="1.0"?><rss version="2.0"><channel><title>T</title><item><title>A</title><link>https://example.com/a</link></item></channel></rss>`,
  }),
}));

describe("GET /parse", () => {
  it("returns 400 when url missing", async () => {
    const res = await worker.fetch(new Request("http://localhost/parse"));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("INVALID_URL");
  });

  it("returns parsed feed", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/parse?url=https://example.com/rss.xml")
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { format: string; items: unknown[] };
    expect(body.format).toBe("rss");
    expect(body.items).toHaveLength(1);
  });
});
