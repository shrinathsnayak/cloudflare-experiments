import type { SecretsStoreSecret } from "../types/env";
import type { SecretStatus } from "../types/secret";

/** Never log or return the full secret. */
export function previewSecret(value: string): string {
  if (value.length === 0) return "***";
  if (value.length === 1) return `${value}***`;
  return `${value.slice(0, 2)}***`;
}

export async function readSecretStatus(
  binding: SecretsStoreSecret | undefined
): Promise<SecretStatus> {
  if (!binding || typeof binding.get !== "function") {
    return { configured: false };
  }

  try {
    const value = await binding.get();
    if (typeof value !== "string") {
      return { configured: false };
    }
    return {
      configured: true,
      length: value.length,
      preview: previewSecret(value),
    };
  } catch {
    return { configured: false };
  }
}

export async function verifySecret(
  binding: SecretsStoreSecret | undefined,
  expected: string
): Promise<boolean> {
  if (!binding || typeof binding.get !== "function") {
    return false;
  }

  try {
    const value = await binding.get();
    return value === expected;
  } catch {
    return false;
  }
}
