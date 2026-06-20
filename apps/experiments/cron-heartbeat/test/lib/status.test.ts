import { describe, it, expect } from "vitest";
import { getHeartbeatStatus, recordHeartbeat } from "../../src/lib/status";
import type { Env } from "../../src/types/env";

function createMockKv(store = new Map<string, string>()) {
  return {
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => {
      store.set(key, value);
    },
  } as KVNamespace;
}

describe("heartbeat status", () => {
  it("returns zeroed status when KV is empty", async () => {
    const env = { STATUS: createMockKv() } as Env;
    await expect(getHeartbeatStatus(env)).resolves.toEqual({
      lastRun: null,
      lastCron: null,
      runCount: 0,
    });
  });

  it("records scheduled runs in KV", async () => {
    const env = { STATUS: createMockKv() } as Env;
    const first = await recordHeartbeat(env, "*/5 * * * *");
    expect(first).toMatchObject({
      lastCron: "*/5 * * * *",
      runCount: 1,
    });
    expect(first.lastRun).toBeTruthy();

    const second = await recordHeartbeat(env, "*/5 * * * *");
    expect(second.runCount).toBe(2);
  });
});
