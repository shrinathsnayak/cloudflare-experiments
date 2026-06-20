import { describe, it, expect } from "vitest";
import worker from "../src/index";
import { validateUrl } from "../src/lib/url";

describe("smoke", () => {
  it("GET / returns app info", async () => {
    const res = await worker.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name?: string };
    expect(body.name).toBe("multi-pop-latency-map");
  });
});

describe("validateUrl", () => {
  it("accepts https URLs", () => {
    expect(validateUrl("https://example.com")).toBe("https://example.com/");
  });
});
