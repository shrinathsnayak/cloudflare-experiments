import { TURNSTILE_VERIFY_URL } from "../constants/defaults";
import type { TurnstileSiteverifyPayload, VerifyResponse } from "../types/verify";

export async function verifyTurnstileToken(secret: string, token: string): Promise<VerifyResponse> {
  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret,
      response: token,
    }),
  });

  if (!response.ok) {
    throw new Error("Turnstile siteverify request failed");
  }

  const payload = (await response.json()) as TurnstileSiteverifyPayload;

  const result: VerifyResponse = {
    success: payload.success,
  };

  if (payload["error-codes"]?.length) {
    result.errorCodes = payload["error-codes"];
  }
  if (payload.hostname) {
    result.hostname = payload.hostname;
  }
  if (payload.action) {
    result.action = payload.action;
  }

  return result;
}
