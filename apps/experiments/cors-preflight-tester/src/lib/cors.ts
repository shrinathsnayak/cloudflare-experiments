import {
  ALLOWED_METHODS,
  MAX_REQUESTED_HEADERS,
  PREFLIGHT_TIMEOUT_MS,
} from "../constants/defaults";
import type { CorsHeaderCheck, CorsTestRequest, CorsTestResponse } from "../types/cors";

function normalizeHeaderList(headers: string[] | undefined): string[] {
  if (!headers?.length) return [];
  return [
    ...new Set(
      headers.map((header) => header.trim().toLowerCase()).filter((header) => header.length > 0)
    ),
  ].slice(0, MAX_REQUESTED_HEADERS);
}

export function validateCorsTestRequest(body: Partial<CorsTestRequest>): CorsTestRequest | null {
  if (!body.url || typeof body.url !== "string") return null;
  if (!body.origin || typeof body.origin !== "string") return null;
  if (!body.method || typeof body.method !== "string") return null;

  const method = body.method.trim().toUpperCase();
  if (!ALLOWED_METHODS.includes(method as (typeof ALLOWED_METHODS)[number])) return null;

  const origin = body.origin.trim();
  if (!origin) return null;

  return {
    url: body.url,
    origin,
    method,
    headers: normalizeHeaderList(body.headers),
  };
}

function parseAllowedList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function includesToken(listValue: string | null, token: string, caseInsensitive = true): boolean {
  const items = parseAllowedList(listValue);
  const needle = caseInsensitive ? token.toLowerCase() : token;
  return items.some((item) => {
    const haystack = caseInsensitive ? item.toLowerCase() : item;
    return haystack === needle;
  });
}

function checkAllowOrigin(origin: string, value: string | null): CorsHeaderCheck {
  if (!value) {
    return {
      header: "Access-Control-Allow-Origin",
      present: false,
      value: null,
      status: "missing",
      detail: "Required for credentialed or cross-origin responses.",
    };
  }

  if (value === "*" || value === origin) {
    return {
      header: "Access-Control-Allow-Origin",
      present: true,
      value,
      status: "ok",
      detail: value === "*" ? "Wildcard origin allowed." : "Echoes requested origin.",
    };
  }

  return {
    header: "Access-Control-Allow-Origin",
    present: true,
    value,
    status: "misconfigured",
    detail: `Does not match requested origin ${origin}.`,
  };
}

function checkAllowMethods(method: string, value: string | null): CorsHeaderCheck {
  if (!value) {
    return {
      header: "Access-Control-Allow-Methods",
      present: false,
      value: null,
      status: "missing",
      detail: `Preflight should allow ${method}.`,
    };
  }

  if (includesToken(value, method)) {
    return {
      header: "Access-Control-Allow-Methods",
      present: true,
      value,
      status: "ok",
      detail: `Includes requested method ${method}.`,
    };
  }

  return {
    header: "Access-Control-Allow-Methods",
    present: true,
    value,
    status: "misconfigured",
    detail: `Does not include requested method ${method}.`,
  };
}

function checkAllowHeaders(requestedHeaders: string[], value: string | null): CorsHeaderCheck {
  if (requestedHeaders.length === 0) {
    return {
      header: "Access-Control-Allow-Headers",
      present: Boolean(value),
      value,
      status: value ? "ok" : "missing",
      detail: value
        ? "No custom headers requested; header present."
        : "No custom headers requested; header optional.",
    };
  }

  if (!value) {
    return {
      header: "Access-Control-Allow-Headers",
      present: false,
      value: null,
      status: "missing",
      detail: `Should allow: ${requestedHeaders.join(", ")}`,
    };
  }

  const missing = requestedHeaders.filter((header) => !includesToken(value, header));
  if (missing.length === 0) {
    return {
      header: "Access-Control-Allow-Headers",
      present: true,
      value,
      status: "ok",
      detail: "Includes all requested headers.",
    };
  }

  return {
    header: "Access-Control-Allow-Headers",
    present: true,
    value,
    status: "misconfigured",
    detail: `Missing requested headers: ${missing.join(", ")}`,
  };
}

export async function runCorsPreflightTest(request: CorsTestRequest): Promise<CorsTestResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PREFLIGHT_TIMEOUT_MS);
  const started = performance.now();

  const res = await fetch(request.url, {
    method: "OPTIONS",
    headers: {
      Origin: request.origin,
      "Access-Control-Request-Method": request.method,
      ...(request.headers?.length
        ? { "Access-Control-Request-Headers": request.headers.join(", ") }
        : {}),
    },
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  const responseTimeMs = Math.round(performance.now() - started);
  const allowOrigin = res.headers.get("Access-Control-Allow-Origin");
  const allowMethods = res.headers.get("Access-Control-Allow-Methods");
  const allowHeaders = res.headers.get("Access-Control-Allow-Headers");
  const maxAge = res.headers.get("Access-Control-Max-Age");
  const allowCredentials = res.headers.get("Access-Control-Allow-Credentials");

  const checks: CorsHeaderCheck[] = [
    checkAllowOrigin(request.origin, allowOrigin),
    checkAllowMethods(request.method, allowMethods),
    checkAllowHeaders(request.headers ?? [], allowHeaders),
    {
      header: "Access-Control-Max-Age",
      present: Boolean(maxAge),
      value: maxAge,
      status: maxAge ? "ok" : "missing",
      detail: maxAge ? "Preflight cache duration provided." : "Optional but recommended.",
    },
    {
      header: "Access-Control-Allow-Credentials",
      present: Boolean(allowCredentials),
      value: allowCredentials,
      status:
        allowCredentials === "true" && allowOrigin === "*"
          ? "misconfigured"
          : allowCredentials
            ? "ok"
            : "missing",
      detail:
        allowCredentials === "true" && allowOrigin === "*"
          ? "Credentials cannot be used with wildcard origin."
          : allowCredentials
            ? "Credentials allowed."
            : "Optional unless cookies or auth headers are sent.",
    },
  ];

  const valid = checks.every((check) => {
    if (
      (check.header === "Access-Control-Max-Age" ||
        check.header === "Access-Control-Allow-Credentials") &&
      check.status === "missing"
    ) {
      return true;
    }
    if (
      check.header === "Access-Control-Allow-Headers" &&
      check.status === "missing" &&
      (request.headers?.length ?? 0) === 0
    ) {
      return true;
    }
    return check.status === "ok";
  });

  return {
    url: request.url,
    origin: request.origin,
    method: request.method,
    requestedHeaders: request.headers ?? [],
    statusCode: res.status,
    responseTimeMs,
    checks,
    valid,
  };
}
