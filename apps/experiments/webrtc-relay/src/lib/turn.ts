import { DEFAULT_TTL, MAX_TTL, MIN_TTL, TURN_API_BASE } from "../constants/defaults";
import type { GenerateIceServersApiResponse, TurnCredentialsResponse } from "../types/turn";

export function parseTtl(input: string | undefined): number | null {
  if (input === undefined || input === "") return DEFAULT_TTL;
  const n = Number(input);
  if (!Number.isInteger(n) || n < MIN_TTL || n > MAX_TTL) return null;
  return n;
}

export function isConfigured(appId: string | undefined, token: string | undefined): boolean {
  return Boolean(appId?.trim() && token?.trim());
}

export function demoCredentials(ttl: number): TurnCredentialsResponse {
  return {
    iceServers: [
      {
        urls: ["turn:turn.cloudflare.com:3478?transport=udp"],
        username: "demo",
        credential: "demo",
      },
    ],
    ttl,
    mode: "demo",
    note: "Configure REALTIME_APP_ID and TURN_API_TOKEN for real credentials",
  };
}

export async function fetchTurnCredentials(
  keyId: string,
  apiToken: string,
  ttl: number
): Promise<TurnCredentialsResponse> {
  const res = await fetch(
    `${TURN_API_BASE}/${encodeURIComponent(keyId)}/credentials/generate-ice-servers`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Cloudflare TURN API returned ${res.status}`);
  }

  const data = (await res.json()) as GenerateIceServersApiResponse;
  if (!data.iceServers || !Array.isArray(data.iceServers)) {
    throw new Error("Unexpected TURN API response shape");
  }

  return {
    iceServers: data.iceServers,
    ttl,
    mode: "live",
  };
}
