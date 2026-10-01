import { describe, it, expect, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }));

const { default: worker } = await import("../src/index");

describe("smoke", () => {
  it("GET / returns 200 with app info", async () => {
    const res = await worker.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name?: string; description?: string };
    expect(body.name).toBe("one-time-secret");
    expect(body.description).toBeDefined();
  });
});
