import { COMPATIBILITY_DATE, MAIN_MODULE, MAX_CODE_LENGTH } from "../constants/defaults";
import type { Env, WorkerCode } from "../types/env";
import type { RunResult } from "../types/run";

export function validateCode(input: string | undefined): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_CODE_LENGTH) return null;
  return trimmed;
}

export function buildWorkerCode(code: string): WorkerCode {
  return {
    compatibilityDate: COMPATIBILITY_DATE,
    mainModule: MAIN_MODULE,
    modules: {
      [MAIN_MODULE]: code,
    },
    globalOutbound: null,
  };
}

async function hashId(code: string): Promise<string> {
  const data = new TextEncoder().encode(code);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

export async function runDynamicWorker(env: Env, code: string): Promise<RunResult> {
  if (!env.LOADER) {
    throw new Error("LOADER binding is not configured");
  }

  const id = await hashId(code);
  const workerCode = buildWorkerCode(code);
  const stub = env.LOADER.get(id, () => workerCode);
  const entrypoint = stub.getEntrypoint();
  const response = await entrypoint.fetch(new Request("https://dynamic-worker/"));

  const contentType = response.headers.get("content-type") ?? "";
  let body: unknown;
  if (contentType.includes("application/json")) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  return { status: response.status, body };
}
