import type { Env } from "../types/env";
import type { EchoResult } from "../types/echo";

const INSTANCE_NAME = "default";

export function getEchoStub(env: Env): DurableObjectStub {
  if (typeof env.ECHO.getByName === "function") {
    return env.ECHO.getByName(INSTANCE_NAME);
  }
  const id = env.ECHO.idFromName(INSTANCE_NAME);
  return env.ECHO.get(id);
}

export async function echoMessage(env: Env, message: string): Promise<EchoResult> {
  const stub = getEchoStub(env);
  const response = await stub.fetch("https://echo/echo", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: message,
  });

  if (!response.ok) {
    throw new Error(`Container echo failed with status ${response.status}`);
  }

  return (await response.json()) as EchoResult;
}

export function validateMessage(input: string | undefined | null): string | null {
  if (typeof input !== "string") return null;
  if (input.length === 0 || input.length > 10_000) return null;
  return input;
}
