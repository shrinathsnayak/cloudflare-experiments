/** Baseline browser hardening for all HTML/API responses. */
export const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next/Fumadocs hydrate with inline bootstrapping; Traks loads same-origin `/t.js`.
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://deploy.workers.cloudflare.com",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

/** CDN-friendly caching for mostly-static docs HTML. */
export const DOCS_CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";

/** Short edge cache for search JSON (pairs with per-IP rate limits). */
export const SEARCH_CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=300";

/** Markdown / llms.txt exports change with deploys; allow brief edge reuse. */
export const MARKDOWN_CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";

/** @param {Headers} headers */
export function applySecurityHeaders(headers) {
  for (const { key, value } of SECURITY_HEADERS) {
    headers.set(key, value);
  }
}
