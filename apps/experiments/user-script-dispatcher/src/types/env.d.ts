/// <reference types="@cloudflare/workers-types" />

/** Workers for Platforms dispatch namespace binding. */
export interface DispatchNamespace {
  get(name: string): Fetcher;
}

export interface Env {
  SCRIPTS: KVNamespace;
  /** Present when Workers for Platforms dispatch_namespaces is configured. */
  DISPATCHER?: DispatchNamespace;
}
