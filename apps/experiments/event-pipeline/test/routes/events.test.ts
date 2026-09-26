import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

const send = vi.fn().mockResolvedValue(undefined);
const put = vi.fn().mockResolvedValue(undefined);
const get = vi.fn().mockResolvedValue(null);

function mockEnv(withPipeline = true) {
  return {
    ...(withPipeline ? { PIPELINE: { send } } : {}),
    EVENTS: { get, put } as unknown as R2Bucket,
  };
}

describe("POST /events", () => {
  it("sends events to the pipeline when bound", async () => {
    send.mockClear();

    const res = await worker.fetch(
      new Request("http://localhost/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "signup", userId: "u1" }),
      }),
      mockEnv(true)
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      ok?: boolean;
      count?: number;
      transport?: string;
    };
    expect(body.ok).toBe(true);
    expect(body.count).toBe(1);
    expect(body.transport).toBe("pipeline");
    expect(send).toHaveBeenCalledWith([{ type: "signup", userId: "u1" }]);
  });

  it("falls back to R2 when PIPELINE is missing", async () => {
    put.mockClear();
    get.mockResolvedValue(null);

    const res = await worker.fetch(
      new Request("http://localhost/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([{ type: "a" }, { type: "b" }]),
      }),
      mockEnv(false)
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { transport?: string; count?: number };
    expect(body.transport).toBe("r2");
    expect(body.count).toBe(2);
    expect(put).toHaveBeenCalled();
    const [key, value] = put.mock.calls[0] as [string, string];
    expect(key).toMatch(/^events\/\d{4}-\d{2}-\d{2}\.jsonl$/);
    expect(value).toContain('"type":"a"');
  });

  it("returns TOO_MANY_EVENTS for >100 events", async () => {
    const events = Array.from({ length: 101 }, (_, i) => ({ i }));
    const res = await worker.fetch(
      new Request("http://localhost/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(events),
      }),
      mockEnv(true)
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("TOO_MANY_EVENTS");
  });

  it("returns PIPELINE_ERROR when send fails", async () => {
    send.mockRejectedValueOnce(new Error("pipeline down"));

    const res = await worker.fetch(
      new Request("http://localhost/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "x" }),
      }),
      mockEnv(true)
    );

    expect(res.status).toBe(502);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("PIPELINE_ERROR");
  });
});

describe("GET /events/sample", () => {
  it("returns sample schema", async () => {
    const res = await worker.fetch(new Request("http://localhost/events/sample"), mockEnv(true));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { schema?: unknown; maxEvents?: number };
    expect(body.schema).toBeDefined();
    expect(body.maxEvents).toBe(100);
  });
});
