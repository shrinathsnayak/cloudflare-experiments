import { SANDBOX_ID, SNIPPET_PATH } from "../constants/defaults";
import type { Env } from "../types/env";
import type { ExecResult } from "../types/exec";

export type SandboxClient = {
  writeFile(path: string, content: string): Promise<unknown>;
  exec(command: string): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
  }>;
};

export type GetSandboxFn = (namespace: Env["Sandbox"], id: string) => SandboxClient;

let getSandboxImpl: GetSandboxFn | null = null;

/** Test hook to inject a mock sandbox without Docker / cloudflare: imports. */
export function setGetSandboxForTests(fn: GetSandboxFn | null): void {
  getSandboxImpl = fn;
}

async function resolveSandbox(env: Env): Promise<SandboxClient> {
  if (getSandboxImpl) {
    return getSandboxImpl(env.Sandbox, SANDBOX_ID);
  }
  const { getSandbox } = await import("@cloudflare/sandbox");
  // Env uses untyped DO namespace for Node/vitest; cast for Sandbox SDK.
  return getSandbox(
    env.Sandbox as unknown as Parameters<typeof getSandbox>[0],
    SANDBOX_ID
  ) as unknown as SandboxClient;
}

export async function execJavascript(env: Env, code: string): Promise<ExecResult> {
  const sandbox = await resolveSandbox(env);
  await sandbox.writeFile(SNIPPET_PATH, code);
  const result = await sandbox.exec(`node ${SNIPPET_PATH}`);
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    exitCode: result.exitCode ?? 1,
  };
}
