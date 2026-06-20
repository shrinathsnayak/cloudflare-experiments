import { describe, it, expect } from "vitest";
import worker from "../src/index";

describe("smoke", () => {
  it("GET / returns 200 with app info", async () => {
    const res = await worker.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name?: string; description?: string };
    expect(body.name).toBe("webhook-relay-inspector");
    expect(body.description).toBeDefined();
  });
});

describe("relay routes", () => {
  it("returns 400 for invalid relay id on capture", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/relay/not-a-uuid", { method: "POST" })
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_ID");
  });

  it("returns 400 for invalid relay id on list", async () => {
    const res = await worker.fetch(new Request("http://localhost/relay/not-a-uuid/requests"));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_ID");
  });
});
