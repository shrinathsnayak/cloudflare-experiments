import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

function createKv() {
  const data = new Map<string, string>();
  return {
    data,
    get: vi.fn(async (key: string) => data.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => {
      data.set(key, value);
    }),
    delete: vi.fn(async (key: string) => {
      data.delete(key);
    }),
  };
}

describe("tail handler", () => {
  it("stores recent events in KV", async () => {
    const kv = createKv();
    const events = [
      {
        scriptName: "producer",
        outcome: "ok",
        eventTimestamp: 2000,
        logs: [{ message: "first", level: "info", timestamp: 2000 }],
        exceptions: [],
        diagnosticsChannelEvents: [],
      },
      {
        scriptName: "producer",
        outcome: "exception",
        eventTimestamp: 3000,
        logs: [{ message: "boom", level: "error", timestamp: 3000 }],
        exceptions: [],
        diagnosticsChannelEvents: [],
      },
    ] as unknown as TraceItem[];

    await worker.tail(events, { TAIL_LOGS: kv as unknown as KVNamespace });

    expect(kv.put).toHaveBeenCalled();
    const stored = JSON.parse(kv.data.get("recent")!) as {
      scriptName: string;
      outcome: string;
      logs: string[];
    }[];
    expect(stored).toHaveLength(2);
    expect(stored[0].scriptName).toBe("producer");
    expect(stored[0].logs).toEqual(["first"]);
    expect(stored[1].outcome).toBe("exception");
  });

  it("keeps at most 50 events", async () => {
    const kv = createKv();
    const existing = Array.from({ length: 48 }, (_, i) => ({
      scriptName: "old",
      outcome: "ok",
      eventTimestamp: i,
      logs: [`old-${i}`],
    }));
    kv.data.set("recent", JSON.stringify(existing));

    const events = Array.from({ length: 5 }, (_, i) => ({
      scriptName: "new",
      outcome: "ok",
      eventTimestamp: 1000 + i,
      logs: [{ message: `new-${i}`, level: "info", timestamp: 1000 + i }],
      exceptions: [],
      diagnosticsChannelEvents: [],
    })) as unknown as TraceItem[];

    await worker.tail(events, { TAIL_LOGS: kv as unknown as KVNamespace });

    const stored = JSON.parse(kv.data.get("recent")!) as unknown[];
    expect(stored).toHaveLength(50);
  });
});

describe("logs routes", () => {
  it("GET /logs returns stored events", async () => {
    const kv = createKv();
    kv.data.set(
      "recent",
      JSON.stringify([
        {
          scriptName: "producer",
          outcome: "ok",
          eventTimestamp: 1,
          logs: ["hi"],
        },
      ])
    );

    const res = await worker.fetch(new Request("http://localhost/logs"), {
      TAIL_LOGS: kv as unknown as KVNamespace,
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { count?: number; events?: unknown[] };
    expect(body.count).toBe(1);
    expect(body.events).toHaveLength(1);
  });

  it("DELETE /logs clears KV", async () => {
    const kv = createKv();
    kv.data.set("recent", "[]");

    const res = await worker.fetch(new Request("http://localhost/logs", { method: "DELETE" }), {
      TAIL_LOGS: kv as unknown as KVNamespace,
    });
    expect(res.status).toBe(200);
    expect(kv.data.has("recent")).toBe(false);
  });
});
