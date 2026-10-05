import { describe, it, expect } from "vitest";
import worker from "../../src/index";

describe("GET /indicators", () => {
  it("returns 500 when credentials are missing", async () => {
    const res = await worker.fetch(new Request("http://localhost/indicators"), {} as any);
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe("MISSING_CONFIG");
  });
});
