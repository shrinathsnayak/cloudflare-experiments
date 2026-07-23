import { describe, it, expect } from "vitest";
import worker from "../src/index";

describe("smoke", () => {
  it("GET / returns 200 with app info", async () => {
    const res = await worker.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name?: string; description?: string };
    expect(body.name).toBe("html-to-markdown");
    expect(body.description).toBeDefined();
  });

  it("GET /markdown without url returns 400", async () => {
    const res = await worker.fetch(new Request("http://localhost/markdown"));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_URL");
  });
});
