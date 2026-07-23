import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

vi.mock("../../src/lib/inspect", () => ({
  inspectRobotsAndSitemaps: vi.fn().mockResolvedValue({
    url: "https://example.com/",
    robots: {
      present: true,
      url: "https://example.com/robots.txt",
      groups: [{ userAgent: "*", allow: [], disallow: ["/admin"] }],
      sitemaps: ["https://example.com/sitemap.xml"],
    },
    sitemaps: [
      {
        url: "https://example.com/sitemap.xml",
        ok: true,
        type: "urlset",
        urlCount: 2,
        sampleUrls: ["https://example.com/", "https://example.com/about"],
      },
    ],
  }),
}));

describe("GET /inspect", () => {
  it("returns 400 when url is missing", async () => {
    const res = await worker.fetch(new Request("http://localhost/inspect"));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("INVALID_URL");
  });

  it("returns 200 with robots and sitemaps", async () => {
    const res = await worker.fetch(new Request("http://localhost/inspect?url=https://example.com"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      robots: { present: boolean };
      sitemaps: unknown[];
    };
    expect(body.robots.present).toBe(true);
    expect(body.sitemaps).toHaveLength(1);
  });
});
