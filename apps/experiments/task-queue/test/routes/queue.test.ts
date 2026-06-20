import { describe, it, expect } from "vitest";
import worker from "../../src/index";

function createMockEnv() {
  const store = new Map<string, string>();
  const kv = {
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => {
      store.set(key, value);
    },
  } as KVNamespace;

  const queue = {
    send: async () => undefined,
    sendBatch: async () => undefined,
    metrics: { queue: "task-queue", messages: 0 },
  } as unknown as Queue;

  return { STATS: kv, TASK_QUEUE: queue };
}

describe("queue routes", () => {
  it("returns 400 for invalid enqueue body", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "" }),
      }),
      createMockEnv()
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("INVALID_MESSAGE");
  });

  it("enqueues valid messages", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "sync analytics" }),
      }),
      createMockEnv()
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { queued: boolean; message: string };
    expect(body.queued).toBe(true);
    expect(body.message).toBe("sync analytics");
  });
});
