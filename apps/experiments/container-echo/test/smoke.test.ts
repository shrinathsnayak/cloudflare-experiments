import { describe, it, expect } from "vitest";
import app from "../src/app";

describe("smoke", () => {
  it("GET / returns 200 with app info", async () => {
    const res = await app.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name?: string; description?: string };
    expect(body.name).toBe("container-echo");
    expect(body.description).toBeDefined();
  });
});
