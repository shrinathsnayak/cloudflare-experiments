import { TURNSTILE_VERIFY_URL } from "../constants/defaults";
import type { TurnstileSiteverifyPayload } from "../types/form";

export async function verifyTurnstile(
  secret: string,
  token: string,
  remoteIp?: string
): Promise<{ success: boolean; errorCodes: string[] }> {
  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, response: token, ...(remoteIp ? { remoteip: remoteIp } : {}) }),
  });
  if (!res.ok) {
    throw new Error(`Turnstile siteverify returned HTTP ${res.status}`);
  }
  const payload = (await res.json()) as TurnstileSiteverifyPayload;
  return { success: payload.success === true, errorCodes: payload["error-codes"] ?? [] };
}
