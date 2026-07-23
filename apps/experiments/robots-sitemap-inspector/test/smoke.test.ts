import { describe, it, expect } from "vitest";
import worker from "../src/index";

describe("GET /", () => {
  it("returns 200 with name and description", async () => {
    const res = await worker.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name: string; description: string };
    expect(body.name).toBe("robots-sitemap-inspector");
    expect(body.description).toBeTruthy();
  });
});
