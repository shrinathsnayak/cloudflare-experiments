import { FETCH_TIMEOUT_MS, MAX_SITEMAPS, USER_AGENT } from "../constants/defaults";
import type { InspectResponse } from "../types/inspect";
import { parseRobotsTxt } from "./robots";
import { inspectSitemap } from "./sitemap";
import { originFromUrl } from "./url";

async function fetchRobots(
  robotsUrl: string
): Promise<{ ok: true; text: string } | { ok: false; status?: number; error: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(robotsUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "text/plain,*/*" },
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      return { ok: false, status: res.status, error: `HTTP ${res.status}` };
    }
    return { ok: true, text: await res.text() };
  } catch (e) {
    clearTimeout(timeoutId);
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

/**
 * Inspect robots.txt and linked sitemaps for a URL's origin.
 */
export async function inspectRobotsAndSitemaps(url: string): Promise<InspectResponse> {
  const origin = originFromUrl(url);
  const robotsUrl = `${origin}/robots.txt`;
  const robotsFetch = await fetchRobots(robotsUrl);

  if (!robotsFetch.ok) {
    return {
      url,
      robots: {
        present: false,
        url: robotsUrl,
        groups: [],
        sitemaps: [],
        error: robotsFetch.error,
      },
      sitemaps: [],
    };
  }

  const parsed = parseRobotsTxt(robotsFetch.text);
  const sitemapUrls = parsed.sitemaps.slice(0, MAX_SITEMAPS);
  const sitemaps = await Promise.all(sitemapUrls.map((s) => inspectSitemap(s)));

  return {
    url,
    robots: {
      present: true,
      url: robotsUrl,
      groups: parsed.groups,
      sitemaps: parsed.sitemaps,
      rawPreview: robotsFetch.text.slice(0, 500),
    },
    sitemaps,
  };
}
