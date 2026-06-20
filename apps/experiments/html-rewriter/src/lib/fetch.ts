import { MAX_HTML_BYTES } from "../constants/defaults";

export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "cloudflare-experiments/html-rewriter" },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`Upstream returned HTTP ${res.status}`);
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
    throw new Error("URL did not return HTML content");
  }
  const buffer = await res.arrayBuffer();
  if (buffer.byteLength > MAX_HTML_BYTES) {
    throw new Error("HTML response exceeds size limit");
  }
  return new TextDecoder().decode(buffer);
}
