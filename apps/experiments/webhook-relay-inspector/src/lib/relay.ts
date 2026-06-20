import type { RelaySessionMeta } from "../types/relay";

export const SESSION_META_KEY = "session";
export const REQUEST_INDEX_KEY = "request-index";

export function createSessionMeta(id: string): RelaySessionMeta {
  return {
    id,
    createdAt: new Date().toISOString(),
  };
}

export function requestStorageKey(requestId: string): string {
  return `request:${requestId}`;
}

export function getRelayStub(relay: DurableObjectNamespace, id: string): DurableObjectStub {
  return relay.get(relay.idFromName(id));
}
