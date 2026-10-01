import type { HashAlgorithm, HashResult } from "../types/tools";

/** Hashes UTF-8 text with Web Crypto and returns lowercase hex. */
export async function hashText(text: string, algorithm: HashAlgorithm): Promise<HashResult> {
  const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(text));
  const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  return { algorithm, hex };
}
