const encoder = new TextEncoder();

async function sha256(input: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(input)));
}

export async function hashIp(ip: string, salt = ""): Promise<string> {
  const bytes = await sha256(`${salt}:${ip}`);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Compares SHA-256 digests so timing does not leak the token length or prefix. */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const [x, y] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export async function isAdmin(authorization: string | undefined, token: string | undefined) {
  if (!token || !authorization?.startsWith("Bearer ")) return false;
  return safeEqual(authorization.slice("Bearer ".length).trim(), token);
}

export function createFormId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}
