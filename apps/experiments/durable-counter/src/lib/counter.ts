import type { Env } from "../types/env";
import type { CounterAction, CounterValue } from "../types/counter";

const COUNTER_NAME = "global";

export function getCounterStub(env: Env): DurableObjectStub {
  const id = env.COUNTER.idFromName(COUNTER_NAME);
  return env.COUNTER.get(id);
}

export async function callCounter(env: Env, action: CounterAction): Promise<CounterValue> {
  const stub = getCounterStub(env);
  const response = await stub.fetch(`https://counter/${action}`, {
    method: action === "get" ? "GET" : "POST",
  });

  if (!response.ok) {
    throw new Error(`Counter request failed with status ${response.status}`);
  }

  return (await response.json()) as CounterValue;
}
