import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

vi.mock("../../src/lib/radar", () => ({
  getRadarFact: vi.fn().mockResolvedValue({
    type: "domain",
    target: "cloudflare.com",
    fact: "Domain rank in global top domains",
    ranking: 150,
  }),
}));

describe("GET /radar", () => {
  it("returns 400 when both domain and asn are missing", async () => {
    const res = await worker.fetch(new Request("http://localhost/radar"));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe("MISSING_PARAMETER");
  });

  it("returns 400 when both domain and asn are provided", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/radar?domain=example.com&asn=13335")
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe("INVALID_PARAMETER");
  });

  it("returns 200 with domain fact when domain is provided", async () => {
    const res = await worker.fetch(new Request("http://localhost/radar?domain=cloudflare.com"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      type: string;
      target: string;
      fact: string;
      ranking?: number;
    };
    expect(body.type).toBe("domain");
    expect(body.target).toBe("cloudflare.com");
    expect(body.ranking).toBe(150);
  });
});
