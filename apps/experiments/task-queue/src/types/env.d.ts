/// <reference types="@cloudflare/workers-types" />

export interface Env {
  TASK_QUEUE: Queue<TaskMessage>;
  STATS: KVNamespace;
}
