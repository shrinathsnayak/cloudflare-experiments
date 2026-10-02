import { SecretVault } from "../../src/secret-vault";

/** Callers must `vi.mock("cloudflare:workers", ...)` before importing this helper. */
export function createFakeState() {
  const data = new Map<string, unknown>();
  let alarm: number | null = null;
  let chain: Promise<unknown> = Promise.resolve();

  const storage = {
    get: async (key: string) => data.get(key),
    put: async (key: string, value: unknown) => void data.set(key, structuredClone(value)),
    deleteAll: async () => data.clear(),
    setAlarm: async (time: number) => void (alarm = time),
    deleteAlarm: async () => void (alarm = null),
    getAlarm: async () => alarm,
  };

  const state = {
    storage,
    blockConcurrencyWhile<T>(fn: () => Promise<T>): Promise<T> {
      const run = chain.then(fn);
      chain = run.catch(() => undefined);
      return run;
    },
  };

  return { state: state as unknown as DurableObjectState, data, getAlarm: () => alarm };
}

export function createFakeNamespace() {
  const instances = new Map<string, SecretVault>();
  const namespace = {
    idFromName: (name: string) => name,
    get(id: string) {
      let instance = instances.get(id);
      if (!instance) {
        instance = new SecretVault(createFakeState().state, { SECRETS: namespace as never });
        instances.set(id, instance);
      }
      return instance;
    },
  };
  return namespace as unknown as DurableObjectNamespace<SecretVault>;
}
