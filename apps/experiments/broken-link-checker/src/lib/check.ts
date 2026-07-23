import { PAGE_FETCH_TIMEOUT_MS, USER_AGENT } from "../constants/defaults";
import type { CheckResponse } from "../types/check";
import { extractLinks } from "./extract";
import { probeLinks } from "./probe";

export type PageFetchResult =
  | { ok: true; url: string; html: string }
  | { ok: false; code: "FETCH_ERROR" | "NOT_HTML"; error: string };

export async function fetchPageHtml(url: string): Promise<PageFetchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PAGE_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,*/*" },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { ok: false, code: "FETCH_ERROR", error: `HTTP ${res.status}` };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return {
        ok: false,
        code: "NOT_HTML",
        error: `Expected HTML, got content-type: ${contentType || "unknown"}`,
      };
    }

    return { ok: true, url: res.url || url, html: await res.text() };
  } catch (e) {
    clearTimeout(timeoutId);
    return {
      ok: false,
      code: "FETCH_ERROR",
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

export async function checkBrokenLinks(
  pageUrl: string,
  html: string,
  limit: number
): Promise<CheckResponse> {
  const hrefs = extractLinks(html, pageUrl).slice(0, limit);
  const links = await probeLinks(hrefs);
  const broken = links.filter((l) => !l.ok).length;
  return {
    url: pageUrl,
    checked: links.length,
    broken,
    links,
  };
}
