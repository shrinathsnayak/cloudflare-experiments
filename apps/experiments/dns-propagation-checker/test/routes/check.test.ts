import { describe, it, expect, vi, beforeEach } from "vitest";
import worker from "../../src/index";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("GET /check", () => {
  it("returns 400 for invalid domain", async () => {
    const res = await worker.fetch(new Request("http://localhost/check?domain=bad_domain"));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("INVALID_DOMAIN");
  });

  it("returns 400 for invalid record type", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/check?domain=example.com&type=SOA")
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("INVALID_RECORD_TYPE");
  });

  it("returns resolver comparison for valid query", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        Status: 0,
        Answer: [{ name: "example.com.", type: 1, TTL: 300, data: "93.184.216.34" }],
      }),
    });

    const res = await worker.fetch(new Request("http://localhost/check?domain=example.com&type=A"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      agreement: boolean;
      resolvers: Array<{ resolver: string; values: string[] }>;
    };
    expect(body.agreement).toBe(true);
    expect(body.resolvers).toHaveLength(3);
  });
});
