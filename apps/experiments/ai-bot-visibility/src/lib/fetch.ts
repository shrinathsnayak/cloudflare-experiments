import { FETCH_TIMEOUT_MS, MAX_HTML_BYTES, MAX_ROBOTS_BYTES } from "../constants/defaults";

const USER_AGENT = "Cloudflare-Experiments-AiBotVisibility/1.0";

export type PageFetchResult = {
  html: string;
  headers: Record<string, string>;
  statusCode: number;
};

/**
 * Fetches a page and returns HTML plus response headers (lowercased keys).
 * Truncates body to MAX_HTML_BYTES.
 */
export async function fetchPage(url: string): Promise<PageFetchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html",
      },
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const html = text.length > MAX_HTML_BYTES ? text.slice(0, MAX_HTML_BYTES) : text;
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      headers[k.toLowerCase()] = v;
    });
    return { html, headers, statusCode: res.status };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches robots.txt for the given origin (e.g. https://www.cloudflare.com).
 * Returns body string or null on 404/5xx or error. Truncates to MAX_ROBOTS_BYTES.
 */
export async function fetchRobotsTxt(origin: string): Promise<string | null> {
  const url = `${origin.replace(/\/$/, "")}/robots.txt`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const text = await res.text();
    return text.length > MAX_ROBOTS_BYTES ? text.slice(0, MAX_ROBOTS_BYTES) : text;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}
