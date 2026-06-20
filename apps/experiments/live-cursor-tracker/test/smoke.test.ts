import { describe, it, expect } from "vitest";
import worker from "../src/app";

describe("smoke", () => {
  it("GET / returns demo HTML", async () => {
    const res = await worker.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Live Cursor Tracker");
  });

  it("GET /info returns app metadata", async () => {
    const res = await worker.fetch(new Request("http://localhost/info"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name?: string };
    expect(body.name).toBe("live-cursor-tracker");
  });
});
