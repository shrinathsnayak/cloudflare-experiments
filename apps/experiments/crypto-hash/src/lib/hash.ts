import {
  DEFAULT_ALGORITHM,
  MAX_TEXT_LENGTH,
  SUPPORTED_ALGORITHMS,
  type HashAlgorithm,
} from "../constants/algorithms";

export function validateText(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_TEXT_LENGTH) return null;
  return trimmed;
}

export function normalizeAlgorithm(input: string | undefined): HashAlgorithm | null {
  const raw = (input ?? DEFAULT_ALGORITHM).trim().toUpperCase().replace(/_/g, "-");
  const normalized = raw.startsWith("SHA") && !raw.includes("-") ? raw.replace("SHA", "SHA-") : raw;

  if (SUPPORTED_ALGORITHMS.includes(normalized as HashAlgorithm)) {
    return normalized as HashAlgorithm;
  }
  return null;
}

export async function hashText(text: string, algorithm: HashAlgorithm): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(algorithm, data);
  return bufferToHex(digest);
}

function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
