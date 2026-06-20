/// <reference types="@cloudflare/workers-types" />

import type { RelaySessionMeta } from "./relay";

export interface Env {
  RELAY: DurableObjectNamespace;
}

export type { RelaySessionMeta };
