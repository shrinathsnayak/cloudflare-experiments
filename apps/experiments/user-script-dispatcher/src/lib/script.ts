import {
  CUSTOMER_KEY_PREFIX,
  MAX_NAME_LENGTH,
  MAX_SCRIPT_BYTES,
  NAME_PATTERN,
  SCRIPT_KEY_PREFIX,
} from "../constants/defaults";
import type { ScriptRecord } from "../types/script";

export function validateName(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_NAME_LENGTH) return null;
  if (!NAME_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function validateResponse(input: unknown): Record<string, unknown> | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  return input as Record<string, unknown>;
}

export function scriptKey(name: string): string {
  return `${SCRIPT_KEY_PREFIX}${name}`;
}

export function customerKey(name: string): string {
  return `${CUSTOMER_KEY_PREFIX}${name}`;
}

export function serializeScript(name: string, response: Record<string, unknown>): string | null {
  const record: ScriptRecord = {
    name,
    response,
    updatedAt: new Date().toISOString(),
  };
  const raw = JSON.stringify(record);
  if (raw.length > MAX_SCRIPT_BYTES) return null;
  return raw;
}

export function parseScriptRecord(raw: string): ScriptRecord | null {
  try {
    const parsed = JSON.parse(raw) as Partial<ScriptRecord>;
    if (!parsed.name || typeof parsed.name !== "string") return null;
    if (!parsed.response || typeof parsed.response !== "object") return null;
    return {
      name: parsed.name,
      response: parsed.response as Record<string, unknown>,
      updatedAt: parsed.updatedAt ?? new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export async function saveScript(
  kv: KVNamespace,
  name: string,
  response: Record<string, unknown>
): Promise<ScriptRecord | null> {
  const raw = serializeScript(name, response);
  if (!raw) return null;
  const record = parseScriptRecord(raw);
  if (!record) return null;
  await kv.put(scriptKey(name), raw);
  return record;
}

export async function getScript(kv: KVNamespace, name: string): Promise<ScriptRecord | null> {
  const raw = await kv.get(scriptKey(name));
  if (!raw) return null;
  return parseScriptRecord(raw);
}

export async function registerCustomer(kv: KVNamespace, name: string): Promise<void> {
  await kv.put(customerKey(name), JSON.stringify({ name, registeredAt: new Date().toISOString() }));
}

export async function listCustomers(kv: KVNamespace): Promise<string[]> {
  const listed = await kv.list({ prefix: CUSTOMER_KEY_PREFIX });
  return listed.keys
    .map((k) => k.name.slice(CUSTOMER_KEY_PREFIX.length))
    .filter(Boolean)
    .sort();
}
