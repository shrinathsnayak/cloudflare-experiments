import type { RedirectChainStep } from "../types/redirect-chain";
import { MAX_REDIRECTS, REDIRECT_STATUS_CODES } from "../constants/defaults";

const REDIRECT_SET = new Set<number>(REDIRECT_STATUS_CODES);

function isRedirect(status: number): boolean {
  return REDIRECT_SET.has(status);
}

function resolveNextUrl(currentUrl: string, location: string): string {
  try {
    return new URL(location, currentUrl).href;
  } catch {
    return "";
  }
}

/**
 * Follows redirects manually and returns each hop (url + status).
 * Uses redirect: 'manual' so we capture every response.
 */
export async function getRedirectChain(
  initialUrl: string
): Promise<{ chain: RedirectChainStep[]; error?: string }> {
  const chain: RedirectChainStep[] = [];
  let url: string = initialUrl;
  let hops = 0;

  while (hops <= MAX_REDIRECTS) {
    const res = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": "Edge-Redirect-Simulator/1.0" },
    });

    chain.push({ url, status: res.status });

    if (!isRedirect(res.status)) {
      return { chain };
    }

    const location = res.headers.get("Location");
    if (!location || !location.trim()) {
      return { chain, error: "Redirect response missing Location header" };
    }

    const nextUrl = resolveNextUrl(url, location.trim());
    if (!nextUrl || nextUrl === url) {
      return { chain, error: "Invalid or circular Location header" };
    }

    url = nextUrl;
    hops++;
  }

  return {
    chain,
    error: `Max redirects (${MAX_REDIRECTS}) exceeded; possible redirect loop`,
  };
}
