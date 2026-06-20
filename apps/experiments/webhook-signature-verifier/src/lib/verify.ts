import {
  DEFAULT_ALGORITHM,
  MAX_PAYLOAD_LENGTH,
  MAX_SECRET_LENGTH,
  MAX_SIGNATURE_LENGTH,
  SUPPORTED_ALGORITHMS,
} from "../constants/defaults";
import type { VerifyAlgorithm, VerifyRequest, VerifyResponse } from "../types/verify";

const HEX_REGEX = /^[0-9a-f]+$/i;

function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function normalizeAlgorithm(input: string | undefined): VerifyAlgorithm | null {
  const raw = (input ?? DEFAULT_ALGORITHM).trim().toLowerCase();
  if (!raw) return null;
  const normalized = raw === "hmac_sha256" ? "hmac-sha256" : raw;
  if (SUPPORTED_ALGORITHMS.includes(normalized as VerifyAlgorithm)) {
    return normalized as VerifyAlgorithm;
  }
  return null;
}

export function parseSignature(signature: string): {
  providedHex: string;
  format: "prefixed-hex" | "raw-hex";
} | null {
  const trimmed = signature.trim();
  if (!trimmed) return null;

  const prefixed = trimmed.match(/^sha256=(.+)$/i);
  if (prefixed) {
    const hex = prefixed[1].trim().toLowerCase();
    if (!HEX_REGEX.test(hex)) return null;
    return { providedHex: hex, format: "prefixed-hex" };
  }

  const raw = trimmed.toLowerCase();
  if (!HEX_REGEX.test(raw)) return null;
  return { providedHex: raw, format: "raw-hex" };
}

export async function computeHmacSha256(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return bufferToHex(digest);
}

export function validateVerifyRequest(body: Partial<VerifyRequest>): VerifyRequest | null {
  if (!body.payload || typeof body.payload !== "string") return null;
  if (!body.secret || typeof body.secret !== "string") return null;
  if (!body.signature || typeof body.signature !== "string") return null;
  if (body.payload.length > MAX_PAYLOAD_LENGTH) return null;
  if (body.secret.length > MAX_SECRET_LENGTH) return null;
  if (body.signature.length > MAX_SIGNATURE_LENGTH) return null;
  return {
    payload: body.payload,
    secret: body.secret,
    signature: body.signature,
    algorithm: body.algorithm,
  };
}

export async function verifyWebhookSignature(
  request: VerifyRequest
): Promise<VerifyResponse | { error: string; code: string }> {
  const algorithm = normalizeAlgorithm(request.algorithm);
  if (!algorithm) {
    return {
      error: "Unsupported algorithm (supported: sha256, hmac-sha256)",
      code: "INVALID_ALGORITHM",
    };
  }

  const parsed = parseSignature(request.signature);
  if (!parsed) {
    return {
      error: "Invalid signature format (expected sha256=<hex> or raw hex)",
      code: "INVALID_SIGNATURE",
    };
  }

  const expectedSignature = await computeHmacSha256(request.payload, request.secret);
  const match = timingSafeEqual(expectedSignature, parsed.providedHex);

  const explanation = match
    ? `HMAC-SHA256 signature matches using ${parsed.format} format.`
    : `HMAC-SHA256 signature does not match. Expected ${expectedSignature}, received ${parsed.providedHex}.`;

  return {
    match,
    algorithm,
    expectedSignature,
    providedSignature: parsed.providedHex,
    signatureFormat: parsed.format,
    explanation,
  };
}
