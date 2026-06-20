import { describe, it, expect } from "vitest";
import worker from "../src/index";

describe("smoke", () => {
  it("GET / returns 200 with app info", async () => {
    const res = await worker.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name?: string; description?: string };
    expect(body.name).toBe("readability-extractor");
    expect(body.description).toBeDefined();
  });
});

describe("GET /extract", () => {
  it("returns 400 for missing url", async () => {
    const res = await worker.fetch(new Request("http://localhost/extract"));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_URL");
  });
});
