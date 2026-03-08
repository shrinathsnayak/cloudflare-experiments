import { FETCH_TIMEOUT_MS, MAX_HTML_BYTES } from "../constants/defaults";

export interface FetchResult {
  html: string;
  headers: Record<string, string>;
}

export async function fetchPage(url: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "Cloudflare-Experiments-TechStackDetector/1.0",
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
    return { html, headers };
  } finally {
    clearTimeout(timeoutId);
  }
}
