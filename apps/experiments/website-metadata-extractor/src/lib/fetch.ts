import { FETCH_TIMEOUT_MS, MAX_HTML_BYTES } from "../constants/defaults";

export async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "Cloudflare-Experiments-MetadataExtractor/1.0",
        Accept: "text/html",
      },
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (text.length > MAX_HTML_BYTES) return text.slice(0, MAX_HTML_BYTES);
    return text;
  } finally {
    clearTimeout(timeoutId);
  }
}
