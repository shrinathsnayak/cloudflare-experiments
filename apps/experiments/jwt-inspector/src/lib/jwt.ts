function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
  return atob(padded);
}

function base64UrlEncode(input: string): string {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeJwt(token: string): {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
} {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("JWT must have three segments");
  }
  const header = JSON.parse(base64UrlDecode(parts[0])) as Record<string, unknown>;
  const payload = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;
  return { header, payload };
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const cleaned = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function importRsaPublicKey(pem: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "spki",
    pemToArrayBuffer(pem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

export async function verifyJwt(
  token: string,
  options: { secret?: string; publicKey?: string }
): Promise<{ valid: boolean; algorithm: string; payload: Record<string, unknown> }> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("JWT must have three segments");

  const { header, payload } = decodeJwt(token);
  const alg = String(header.alg ?? "");
  const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const signature = Uint8Array.from(base64UrlDecode(parts[2]), (c) => c.charCodeAt(0));

  if (alg === "HS256") {
    if (!options.secret) throw new Error("HS256 verification requires secret");
    const key = await importHmacKey(options.secret);
    const valid = await crypto.subtle.verify("HMAC", key, signature, data);
    return { valid, algorithm: alg, payload };
  }

  if (alg === "RS256") {
    if (!options.publicKey) throw new Error("RS256 verification requires publicKey PEM");
    const key = await importRsaPublicKey(options.publicKey);
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, data);
    return { valid, algorithm: alg, payload };
  }

  throw new Error(`Unsupported algorithm: ${alg}`);
}

export async function issueHs256Token(
  payload: Record<string, unknown>,
  secret: string
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  return `${data}.${encodedSignature}`;
}

export function validateToken(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.split(".").length !== 3) return null;
  return trimmed;
}
