import { describe, it, expect } from "vitest";
import worker from "../src/index";
import { validateKey } from "../src/lib/usage";

describe("smoke", () => {
  it("GET / returns app info", async () => {
    const res = await worker.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name?: string };
    expect(body.name).toBe("rate-limiter-demo");
  });
});

describe("validateKey", () => {
  it("accepts non-empty keys", () => {
    expect(validateKey("client-1")).toBe("client-1");
  });
});
