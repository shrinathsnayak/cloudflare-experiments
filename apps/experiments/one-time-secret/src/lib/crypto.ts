import { ID_BYTES, IV_BYTES, KEY_BYTES } from "../constants/defaults";
import type { EncryptedSecret } from "../types/secret";
import { fromBase64Url, toBase64Url } from "./encoding";

const ALGORITHM = "AES-GCM";

export function generateId(): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(ID_BYTES)));
}

/** Encrypts with a fresh random AES-256-GCM key. The returned `key` must never be stored server-side. */
export async function encryptSecret(plaintext: string): Promise<EncryptedSecret & { key: string }> {
  const rawKey = crypto.getRandomValues(new Uint8Array(KEY_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await crypto.subtle.importKey("raw", rawKey, ALGORITHM, false, ["encrypt"]);
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  return {
    key: toBase64Url(rawKey),
    iv: toBase64Url(iv),
    ciphertext: toBase64Url(new Uint8Array(ciphertext)),
  };
}

/** Returns the plaintext, or null if the key is malformed or does not authenticate the ciphertext. */
export async function decryptSecret(
  encrypted: EncryptedSecret,
  key: string
): Promise<string | null> {
  const rawKey = fromBase64Url(key);
  const iv = fromBase64Url(encrypted.iv);
  const ciphertext = fromBase64Url(encrypted.ciphertext);
  if (!rawKey || rawKey.length !== KEY_BYTES || !iv || !ciphertext) return null;
  try {
    const cryptoKey = await crypto.subtle.importKey("raw", rawKey, ALGORITHM, false, ["decrypt"]);
    const plaintext = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, cryptoKey, ciphertext);
    return new TextDecoder().decode(plaintext);
  } catch {
    return null;
  }
}
