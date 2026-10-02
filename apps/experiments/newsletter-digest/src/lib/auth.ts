const encoder = new TextEncoder();

/** Compares SHA-256 digests so timing does not leak the token length or prefix. */
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [x, y] = await Promise.all(
    [a, b].map(
      async (s) => new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(s)))
    )
  );
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export async function isAdmin(
  authorization: string | undefined,
  token: string | undefined
): Promise<boolean> {
  if (!token || !authorization?.startsWith("Bearer ")) return false;
  return safeEqual(authorization.slice("Bearer ".length).trim(), token);
}
