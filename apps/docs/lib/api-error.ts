/**
 * Docs API error responses follow the same `{ error, code }` shape as Worker
 * experiments (`jsonError`), without depending on Hono helpers.
 */
export function jsonApiError(
  error: string,
  code: string,
  status: number,
  init?: {
    headers?: HeadersInit;
    extras?: Record<string, unknown>;
  }
): Response {
  const headers = new Headers(init?.headers);
  if (!headers.has("Cache-Control")) {
    headers.set("Cache-Control", "no-store");
  }

  return Response.json(
    {
      error,
      code,
      ...init?.extras,
    },
    { status, headers }
  );
}
