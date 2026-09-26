import { describe, it, expect } from "vitest";
import worker from "../src/index";

describe("smoke", () => {
  it("GET / returns 200 with app info and smart placement hint", async () => {
    const res = await worker.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      name?: string;
      description?: string;
      smartPlacement?: string;
    };
    expect(body.name).toBe("smart-placement-probe");
    expect(body.description).toBeDefined();
    expect(body.smartPlacement).toBeDefined();
  });
});
