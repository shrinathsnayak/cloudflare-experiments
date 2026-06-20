import { describe, it, expect } from "vitest";
import worker from "../../src/index";

describe("GET /echo", () => {
  it("returns 426 when not a WebSocket upgrade", async () => {
    const res = await worker.fetch(new Request("http://localhost/echo"));
    expect(res.status).toBe(426);
    const body = (await res.json()) as { error?: string; code?: string };
    expect(body.code).toBe("NOT_WEBSOCKET");
  });
});
