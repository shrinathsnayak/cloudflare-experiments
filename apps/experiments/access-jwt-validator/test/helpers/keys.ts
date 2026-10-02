import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type JWTPayload } from "jose";

export const TEAM_DOMAIN = "https://testteam.cloudflareaccess.com";
export const POLICY_AUD = "test-aud-tag";
export const env = { TEAM_DOMAIN, POLICY_AUD };

const KID = "test-key";
const { publicKey, privateKey } = await generateKeyPair("RS256", { extractable: true });
const otherPair = await generateKeyPair("RS256", { extractable: true });

export const localKeySet = createLocalJWKSet({
  keys: [{ ...(await exportJWK(publicKey)), kid: KID, alg: "RS256", use: "sig" }],
});

interface MintOptions {
  audience?: string;
  issuer?: string;
  expiresIn?: string | number;
  claims?: JWTPayload;
  signWithOtherKey?: boolean;
}

export function mintAccessJwt(options: MintOptions = {}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    email: "user@example.com",
    country: "US",
    identity_nonce: "nonce-123",
    type: "app",
    ...options.claims,
  })
    .setProtectedHeader({ alg: "RS256", kid: KID })
    .setSubject("user-sub-1")
    .setIssuer(options.issuer ?? TEAM_DOMAIN)
    .setAudience([options.audience ?? POLICY_AUD])
    .setIssuedAt(now - 60)
    .setExpirationTime(options.expiresIn ?? now + 3600)
    .sign(options.signWithOtherKey ? otherPair.privateKey : privateKey);
}
