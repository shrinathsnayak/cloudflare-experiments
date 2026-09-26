import { describe, it, expect } from "vitest";
import worker from "../src/index";

describe("smoke", () => {
  it("GET / returns 200 with app info", async () => {
    const res = await worker.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name?: string; description?: string };
    expect(body.name).toBe("static-assets-spa");
    expect(body.description).toBeDefined();
  });

  it("GET /api/info returns 200 with name", async () => {
    const res = await worker.fetch(new Request("http://localhost/api/info"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name?: string; assetsBinding?: boolean };
    expect(body.name).toBe("static-assets-spa");
    expect(body.assetsBinding).toBe(false);
  });
});
