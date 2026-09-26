/// <reference types="@cloudflare/workers-types" />

export interface Env {
  CHAT_AGENT: DurableObjectNamespace;
  AI?: Ai;
}
