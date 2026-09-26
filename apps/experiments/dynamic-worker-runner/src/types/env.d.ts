/// <reference types="@cloudflare/workers-types" />

export interface WorkerCode {
  compatibilityDate: string;
  mainModule: string;
  modules: Record<string, string>;
  globalOutbound?: null;
}

export interface WorkerEntrypoint {
  fetch(request: Request): Promise<Response>;
}

export interface WorkerStub {
  getEntrypoint(): WorkerEntrypoint;
}

export interface WorkerLoader {
  get(id: string, getCode: () => WorkerCode | Promise<WorkerCode>): WorkerStub;
}

export interface Env {
  LOADER: WorkerLoader;
}
