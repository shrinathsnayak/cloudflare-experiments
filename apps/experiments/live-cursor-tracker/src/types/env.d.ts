/// <reference types="@cloudflare/workers-types" />

export interface Env {
  ROOMS: DurableObjectNamespace;
}

export type CursorMessage = {
  type: "cursor" | "join" | "leave";
  id: string;
  x?: number;
  y?: number;
  color?: string;
  name?: string;
};
