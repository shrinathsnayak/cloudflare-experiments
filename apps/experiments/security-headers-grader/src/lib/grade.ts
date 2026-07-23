import { SCORE_POINTS } from "../constants/defaults";
import type { CheckStatus, GradeResponse, HeaderCheck } from "../types/grade";

function getHeader(headers: Record<string, string>, name: string): string | undefined {
  return headers[name.toLowerCase()];
}

function checkHsts(headers: Record<string, string>): HeaderCheck {
  const value = getHeader(headers, "strict-transport-security");
  if (!value) {
    return {
      header: "Strict-Transport-Security",
      status: "missing",
      detail: "Header not present",
      recommendation: "Add Strict-Transport-Security: max-age=31536000; includeSubDomains",
    };
  }
  const maxAgeMatch = /max-age=(\d+)/i.exec(value);
  const maxAge = maxAgeMatch ? Number(maxAgeMatch[1]) : 0;
  if (maxAge < 15_552_000) {
    return {
      header: "Strict-Transport-Security",
      status: "warn",
      detail: `Present with max-age=${maxAge} (< 180 days)`,
      recommendation: "Use max-age of at least 15552000 (180 days), preferably 31536000",
    };
  }
  return {
    header: "Strict-Transport-Security",
    status: "pass",
    detail: value,
    recommendation: "Looks good",
  };
}

function checkCsp(headers: Record<string, string>): HeaderCheck {
  const value = getHeader(headers, "content-security-policy");
  if (!value) {
    return {
      header: "Content-Security-Policy",
      status: "missing",
      detail: "Header not present",
      recommendation: "Add a Content-Security-Policy that restricts script and object sources",
    };
  }
  if (/unsafe-inline|unsafe-eval/i.test(value) && !/nonce-|sha256-|sha384-|sha512-/.test(value)) {
    return {
      header: "Content-Security-Policy",
      status: "warn",
      detail: "CSP allows unsafe-inline or unsafe-eval without nonces/hashes",
      recommendation: "Prefer nonces or hashes instead of unsafe-inline / unsafe-eval",
    };
  }
  return {
    header: "Content-Security-Policy",
    status: "pass",
    detail: value.length > 120 ? `${value.slice(0, 120)}…` : value,
    recommendation: "Looks good",
  };
}

function checkFrameProtection(headers: Record<string, string>): HeaderCheck {
  const xfo = getHeader(headers, "x-frame-options");
  const csp = getHeader(headers, "content-security-policy") ?? "";
  const hasFrameAncestors = /frame-ancestors/i.test(csp);

  if (!xfo && !hasFrameAncestors) {
    return {
      header: "X-Frame-Options / frame-ancestors",
      status: "missing",
      detail: "Neither X-Frame-Options nor CSP frame-ancestors present",
      recommendation: "Set X-Frame-Options: DENY (or SAMEORIGIN) or CSP frame-ancestors 'none'",
    };
  }
  if (xfo && !/^(deny|sameorigin)$/i.test(xfo.trim())) {
    return {
      header: "X-Frame-Options / frame-ancestors",
      status: "warn",
      detail: `X-Frame-Options is "${xfo}"`,
      recommendation: "Use DENY or SAMEORIGIN",
    };
  }
  return {
    header: "X-Frame-Options / frame-ancestors",
    status: "pass",
    detail: xfo ? `X-Frame-Options: ${xfo}` : "CSP frame-ancestors present",
    recommendation: "Looks good",
  };
}

function checkXcto(headers: Record<string, string>): HeaderCheck {
  const value = getHeader(headers, "x-content-type-options");
  if (!value) {
    return {
      header: "X-Content-Type-Options",
      status: "missing",
      detail: "Header not present",
      recommendation: "Add X-Content-Type-Options: nosniff",
    };
  }
  if (value.toLowerCase() !== "nosniff") {
    return {
      header: "X-Content-Type-Options",
      status: "fail",
      detail: `Unexpected value: ${value}`,
      recommendation: "Set X-Content-Type-Options: nosniff",
    };
  }
  return {
    header: "X-Content-Type-Options",
    status: "pass",
    detail: value,
    recommendation: "Looks good",
  };
}

function checkReferrerPolicy(headers: Record<string, string>): HeaderCheck {
  const value = getHeader(headers, "referrer-policy");
  if (!value) {
    return {
      header: "Referrer-Policy",
      status: "missing",
      detail: "Header not present",
      recommendation: "Add Referrer-Policy: strict-origin-when-cross-origin (or stricter)",
    };
  }
  const weak = ["no-referrer-when-downgrade", "unsafe-url", "origin-when-cross-origin"];
  if (weak.includes(value.toLowerCase())) {
    return {
      header: "Referrer-Policy",
      status: "warn",
      detail: value,
      recommendation: "Prefer strict-origin-when-cross-origin, strict-origin, or no-referrer",
    };
  }
  return {
    header: "Referrer-Policy",
    status: "pass",
    detail: value,
    recommendation: "Looks good",
  };
}

function checkPermissionsPolicy(headers: Record<string, string>): HeaderCheck {
  const value = getHeader(headers, "permissions-policy") ?? getHeader(headers, "feature-policy");
  if (!value) {
    return {
      header: "Permissions-Policy",
      status: "missing",
      detail: "Header not present",
      recommendation: "Add Permissions-Policy to disable unused browser features",
    };
  }
  return {
    header: "Permissions-Policy",
    status: "pass",
    detail: value.length > 120 ? `${value.slice(0, 120)}…` : value,
    recommendation: "Looks good",
  };
}

function checkCoop(headers: Record<string, string>): HeaderCheck {
  const value = getHeader(headers, "cross-origin-opener-policy");
  if (!value) {
    return {
      header: "Cross-Origin-Opener-Policy",
      status: "missing",
      detail: "Header not present",
      recommendation: "Add Cross-Origin-Opener-Policy: same-origin (or same-origin-allow-popups)",
    };
  }
  return {
    header: "Cross-Origin-Opener-Policy",
    status: "pass",
    detail: value,
    recommendation: "Looks good",
  };
}

export function scoreToGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function gradeHeaders(url: string, headers: Record<string, string>): GradeResponse {
  const checks: HeaderCheck[] = [
    checkHsts(headers),
    checkCsp(headers),
    checkFrameProtection(headers),
    checkXcto(headers),
    checkReferrerPolicy(headers),
    checkPermissionsPolicy(headers),
    checkCoop(headers),
  ];

  const total = checks.reduce((sum, check) => sum + SCORE_POINTS[check.status as CheckStatus], 0);
  const score = Math.round(total / checks.length);

  return {
    url,
    score,
    grade: scoreToGrade(score),
    checks,
    headers,
  };
}
