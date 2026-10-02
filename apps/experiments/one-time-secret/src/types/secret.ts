export interface EncryptedSecret {
  /** base64url AES-GCM ciphertext (includes the auth tag) */
  ciphertext: string;
  /** base64url 96-bit IV */
  iv: string;
}

export interface StoredSecret extends EncryptedSecret {
  /** Unix epoch milliseconds */
  expiresAt: number;
}

export type RevealResult =
  | { ok: true; secret: string }
  | { ok: false; code: "NOT_FOUND" | "INVALID_KEY" };

export interface SecretStatus {
  exists: boolean;
  expiresAt: number | null;
}

export interface CreateSecretRequest {
  secret?: unknown;
  ttlSeconds?: unknown;
}

export interface CreateSecretResponse {
  id: string;
  key: string;
  url: string;
  expiresAt: string;
}

export interface SecretStatusResponse {
  id: string;
  exists: boolean;
  expiresAt: string | null;
}
