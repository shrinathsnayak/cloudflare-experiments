import { describe, it, expect } from "vitest";
import worker from "../src/app";

describe("smoke", () => {
  it("GET / returns app info", async () => {
    const res = await worker.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name?: string };
    expect(body.name).toBe("do-alarm-scheduler");
  });
});
