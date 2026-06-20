import { describe, it, expect } from "vitest";
import { Counter } from "../../src/counter";

describe("Counter durable object", () => {
  it("increments and resets persisted value", async () => {
    const storage = new Map<string, unknown>();
    const state = {
      storage: {
        get: async <T>(key: string) => storage.get(key) as T | undefined,
        put: async (key: string, value: unknown) => {
          storage.set(key, value);
        },
      },
      blockConcurrencyWhile: async (fn: () => Promise<void>) => {
        await fn();
      },
    } as unknown as DurableObjectState;

    const counter = new Counter(state);

    const initial = await counter.fetch(new Request("https://counter/get"));
    expect(await initial.json()).toEqual({ value: 0 });

    const incremented = await counter.fetch(new Request("https://counter/increment"));
    expect(await incremented.json()).toEqual({ value: 1 });

    const incrementedAgain = await counter.fetch(new Request("https://counter/increment"));
    expect(await incrementedAgain.json()).toEqual({ value: 2 });

    const reset = await counter.fetch(new Request("https://counter/reset"));
    expect(await reset.json()).toEqual({ value: 0 });
  });
});
