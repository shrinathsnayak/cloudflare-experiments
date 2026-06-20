/// <reference types="@cloudflare/workers-types" />

export interface Env {
  JOBS_QUEUE: Queue<JobMessage>;
  JOBS: KVNamespace;
}

export type JobType = "resize" | "fetch";

export type JobMessage = {
  id: string;
  type: JobType;
  target: string;
  enqueuedAt: string;
};

export type JobStatus = "queued" | "processing" | "done" | "failed";

export type JobRecord = {
  id: string;
  type: JobType;
  target: string;
  status: JobStatus;
  attempts: number;
  enqueuedAt: string;
  updatedAt: string;
  result?: string;
  error?: string;
};
