import { FETCH_TIMEOUT_MS, USER_AGENT } from "../constants/defaults";

export type FeedFetchResult =
  | { ok: true; url: string; body: string }
  | { ok: false; error: string };

export async function fetchFeed(url: string): Promise<FeedFetchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    return { ok: true, url: res.url || url, body: await res.text() };
  } catch (e) {
    clearTimeout(timeoutId);
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}
