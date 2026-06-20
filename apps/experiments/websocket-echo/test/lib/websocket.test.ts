import { describe, it, expect } from "vitest";
import { isWebSocketUpgrade } from "../../src/lib/websocket";

describe("isWebSocketUpgrade", () => {
  it("returns true for websocket upgrade requests", () => {
    const request = new Request("http://localhost/echo", {
      headers: { Upgrade: "websocket" },
    });
    expect(isWebSocketUpgrade(request)).toBe(true);
  });

  it("returns false for regular HTTP requests", () => {
    const request = new Request("http://localhost/echo");
    expect(isWebSocketUpgrade(request)).toBe(false);
  });
});
