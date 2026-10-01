import type { Env } from "./env";

export type TokenSource = "header" | "cookie";

export interface AccessConfig {
  teamDomain: string;
  audience: string;
}

/** Identity claims from a verified Access JWT. Service tokens have `common_name` instead of `email`. */
export interface AccessIdentity {
  email?: string;
  sub: string;
  common_name?: string;
  country?: string;
  identity_nonce?: string;
  type?: string;
  iss: string;
  aud: string[];
  iat?: number;
  exp?: number;
  source: TokenSource;
}

export type AccessErrorCode =
  | "NOT_CONFIGURED"
  | "MISSING_TOKEN"
  | "INVALID_TOKEN"
  | "TOKEN_EXPIRED"
  | "JWKS_UNAVAILABLE";

export type AccessAppEnv = {
  Bindings: Env;
  Variables: { accessIdentity: AccessIdentity };
};
