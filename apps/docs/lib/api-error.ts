/**
 * Docs API error responses follow the same `{ error, code }` shape as Worker
 * experiments (`jsonError`), plus a `hint` so agents know how to recover.
 */

export type ApiErrorBody = {
  error: string;
  code: string;
  hint: string;
  [key: string]: unknown;
};

const DEFAULT_HINTS: Record<string, string> = {
  NOT_FOUND:
    "List public endpoints in /openapi.json or /.well-known/api-catalog, or search docs via GET /api/search?query=…",
  METHOD_NOT_ALLOWED: "Check the Allow header and the OpenAPI operations for this path.",
  RATE_LIMITED: "Wait for Retry-After seconds, then retry with backoff.",
  INVALID_QUERY: "Pass a non-empty query string, e.g. GET /api/search?query=durable+objects",
  INTERNAL_ERROR: "Retry once; if it persists, open a GitHub issue with the request path and time.",
};

export function resolveApiErrorHint(code: string, hint?: string): string {
  if (hint?.trim()) return hint.trim();
  return DEFAULT_HINTS[code] ?? "See /openapi.json and /developers for how to call this API.";
}

export function jsonApiError(
  error: string,
  code: string,
  status: number,
  init?: {
    headers?: HeadersInit;
    extras?: Record<string, unknown>;
    hint?: string;
  }
): Response {
  const headers = new Headers(init?.headers);
  if (!headers.has("Cache-Control")) {
    headers.set("Cache-Control", "no-store");
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }

  const body: ApiErrorBody = {
    error,
    code,
    hint: resolveApiErrorHint(code, init?.hint),
    ...init?.extras,
  };

  return Response.json(body, { status, headers });
}

export function jsonMethodNotAllowed(allowed: readonly string[], hint?: string): Response {
  return jsonApiError(
    `Method not allowed. Allowed: ${allowed.join(", ")}`,
    "METHOD_NOT_ALLOWED",
    405,
    {
      headers: { Allow: allowed.join(", ") },
      hint:
        hint ??
        `Use one of the allowed methods (${allowed.join(", ")}). See /openapi.json for details.`,
    }
  );
}

export function jsonApiNotFound(pathname: string): Response {
  return jsonApiError(`No API endpoint at ${pathname}`, "NOT_FOUND", 404, {
    extras: { path: pathname },
  });
}
