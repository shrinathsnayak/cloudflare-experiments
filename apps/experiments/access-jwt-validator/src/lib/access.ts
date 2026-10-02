import { errors, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from "jose";
import { createMiddleware } from "hono/factory";
import { ACCESS_COOKIE, ACCESS_JWT_ALGORITHMS, ACCESS_JWT_HEADER } from "../constants/defaults";
import type {
  AccessAppEnv,
  AccessConfig,
  AccessErrorCode,
  AccessIdentity,
  TokenSource,
} from "../types/access";
import type { Env } from "../types/env";
import { jsonError } from "../utils/response";
import { getRemoteKeySet } from "./jwks";

export class AccessError extends Error {
  constructor(
    message: string,
    readonly code: AccessErrorCode,
    readonly status: 401 | 500 | 502
  ) {
    super(message);
  }
}

/** Normalizes `yourteam.cloudflareaccess.com` or `https://.../` to `https://yourteam.cloudflareaccess.com`. */
export function normalizeTeamDomain(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

export function getAccessConfig(env: Env): AccessConfig | null {
  const teamDomain = normalizeTeamDomain(env.TEAM_DOMAIN ?? "");
  const audience = env.POLICY_AUD?.trim();
  return teamDomain && audience ? { teamDomain, audience } : null;
}

/** Reads the Access JWT from the `Cf-Access-Jwt-Assertion` header, falling back to the `CF_Authorization` cookie. */
export function getAccessToken(request: Request): { token: string; source: TokenSource } | null {
  const header = request.headers.get(ACCESS_JWT_HEADER)?.trim();
  if (header) return { token: header, source: "header" };

  for (const part of (request.headers.get("Cookie") ?? "").split(";")) {
    const [name, ...rest] = part.trim().split("=");
    const value = rest.join("=").trim();
    if (name === ACCESS_COOKIE && value) return { token: value, source: "cookie" };
  }
  return null;
}

function toIdentity(payload: JWTPayload, source: TokenSource): AccessIdentity {
  const str = (key: string) =>
    typeof payload[key] === "string" ? (payload[key] as string) : undefined;
  return {
    email: str("email"),
    sub: payload.sub ?? "",
    common_name: str("common_name"),
    country: str("country"),
    identity_nonce: str("identity_nonce"),
    type: str("type"),
    iss: payload.iss ?? "",
    aud: Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : [],
    iat: payload.iat,
    exp: payload.exp,
    source,
  };
}

/**
 * Verifies signature (RS256 via the team JWKS), issuer, audience, and expiry.
 * Pass `keySet` to inject a local JWKS (tests, or pre-fetched keys).
 */
export async function verifyAccessJwt(
  token: string,
  config: AccessConfig,
  source: TokenSource = "header",
  keySet: JWTVerifyGetKey = getRemoteKeySet(config.teamDomain)
): Promise<AccessIdentity> {
  try {
    const { payload } = await jwtVerify(token, keySet, {
      issuer: config.teamDomain,
      audience: config.audience,
      algorithms: ACCESS_JWT_ALGORITHMS,
    });
    return toIdentity(payload, source);
  } catch (e) {
    if (e instanceof errors.JWTExpired) {
      throw new AccessError("Access token has expired", "TOKEN_EXPIRED", 401);
    }
    if (
      e instanceof errors.JWKSTimeout ||
      e instanceof errors.JWKSInvalid ||
      !(e instanceof errors.JOSEError) ||
      e.code === "ERR_JOSE_GENERIC"
    ) {
      throw new AccessError("Unable to fetch Access signing keys", "JWKS_UNAVAILABLE", 502);
    }
    throw new AccessError("Invalid Access token", "INVALID_TOKEN", 401);
  }
}

/** Hono middleware: verifies the Access JWT and sets `c.var.accessIdentity`, or responds 401/500/502. */
export const requireAccess = createMiddleware<AccessAppEnv>(async (c, next) => {
  const config = getAccessConfig(c.env);
  if (!config) {
    return jsonError(c, "TEAM_DOMAIN and POLICY_AUD must be configured", "NOT_CONFIGURED", 500);
  }

  const found = getAccessToken(c.req.raw);
  if (!found) {
    return jsonError(
      c,
      `Missing ${ACCESS_JWT_HEADER} header or ${ACCESS_COOKIE} cookie`,
      "MISSING_TOKEN",
      401
    );
  }

  try {
    c.set("accessIdentity", await verifyAccessJwt(found.token, config, found.source));
  } catch (e) {
    if (e instanceof AccessError) return jsonError(c, e.message, e.code, e.status);
    throw e;
  }
  await next();
});
