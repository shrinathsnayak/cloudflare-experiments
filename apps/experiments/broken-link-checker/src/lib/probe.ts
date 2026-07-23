import { LINK_PROBE_TIMEOUT_MS, PROBE_CONCURRENCY, USER_AGENT } from "../constants/defaults";
import type { LinkResult } from "../types/check";

async function probeOne(href: string): Promise<LinkResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LINK_PROBE_TIMEOUT_MS);

  try {
    let res = await fetch(href, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
    });

    if (res.status === 405 || res.status === 501 || res.status === 400) {
      res = await fetch(href, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": USER_AGENT },
      });
    }

    clearTimeout(timeoutId);
    return {
      href,
      statusCode: res.status,
      ok: res.ok,
    };
  } catch (e) {
    clearTimeout(timeoutId);
    return {
      href,
      statusCode: 0,
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

/**
 * Probe links with limited concurrency.
 */
export async function probeLinks(hrefs: string[]): Promise<LinkResult[]> {
  const results: LinkResult[] = [];
  let index = 0;

  async function worker(): Promise<void> {
    while (index < hrefs.length) {
      const current = hrefs[index++];
      results.push(await probeOne(current));
    }
  }

  const workers = Array.from(
    { length: Math.min(PROBE_CONCURRENCY, Math.max(hrefs.length, 1)) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}
