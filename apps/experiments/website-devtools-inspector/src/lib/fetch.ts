import { FETCH_TIMEOUT_MS, MAX_HTML_BYTES } from "../constants/defaults";

export interface FetchResult {
  html: string;
  headers: Record<string, string>;
  statusCode: number;
  responseTimeMs: number;
  cookies: string[];
}

export async function fetchPage(url: string): Promise<FetchResult> {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "Cloudflare-Experiments-DevtoolsInspector/1.0",
        Accept: "text/html",
      },
    });
    const responseTimeMs = Date.now() - start;
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const html = text.length > MAX_HTML_BYTES ? text.slice(0, MAX_HTML_BYTES) : text;
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      headers[k.toLowerCase()] = v;
    });
    const setCookie = res.headers.get("set-cookie");
    const cookies = setCookie ? setCookie.split(",").map((s) => s.trim()) : [];
    return { html, headers, statusCode: res.status, responseTimeMs, cookies };
  } finally {
    clearTimeout(timeoutId);
  }
}
