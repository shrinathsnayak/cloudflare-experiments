import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

const writeDataPoint = vi.fn();

const mockEnv = {
  ANALYTICS: {
    writeDataPoint,
  },
};

describe("POST /track", () => {
  it("returns 200 and writes a data point when event is valid", async () => {
    writeDataPoint.mockClear();

    const res = await worker.fetch(
      new Request("http://localhost/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "signup",
          value: 2,
          tag: "beta",
        }),
      }),
      mockEnv
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok?: boolean; event?: string; value?: number };
    expect(body.ok).toBe(true);
    expect(body.event).toBe("signup");
    expect(body.value).toBe(2);
    expect(writeDataPoint).toHaveBeenCalledWith({
      blobs: ["signup", "beta"],
      doubles: [2],
      indexes: ["signup"],
    });
  });

  it("defaults value to 1 and tag to empty string", async () => {
    writeDataPoint.mockClear();

    const res = await worker.fetch(
      new Request("http://localhost/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "click" }),
      }),
      mockEnv
    );

    expect(res.status).toBe(200);
    expect(writeDataPoint).toHaveBeenCalledWith({
      blobs: ["click", ""],
      doubles: [1],
      indexes: ["click"],
    });
  });

  it("returns 400 when event is missing", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: 1 }),
      }),
      mockEnv
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: string; code?: string };
    expect(body.code).toBe("INVALID_EVENT");
    expect(body.error).toContain("event");
  });

  it("returns 400 when body is not valid JSON", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      }),
      mockEnv
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_BODY");
  });
});
