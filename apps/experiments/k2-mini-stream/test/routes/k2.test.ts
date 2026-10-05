import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

global.fetch = vi.fn();

describe("GET /demo", () => {
  it("returns 500 when K2 credentials are missing", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/demo"),
      {} as any
    );
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe("MISSING_CONFIG");
  });
});
