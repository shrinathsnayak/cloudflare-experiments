import puppeteer from "@cloudflare/puppeteer";
import {
  DEFAULT_VIEWPORT,
  MAX_RECORDED_REQUESTS,
  NAVIGATION_TIMEOUT_MS,
} from "../constants/defaults";
import type { PageCapture } from "../types/scan";

function isTimeoutError(e: unknown): boolean {
  return e instanceof Error && (e.name === "TimeoutError" || /timeout/i.test(e.message));
}

/**
 * Loads `url` without clicking anything (consent banners stay untouched), recording every
 * request and every cookie in the browser jar (all frames, all domains).
 */
export async function capturePage(browserBinding: Fetcher, url: string): Promise<PageCapture> {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  try {
    browser = await puppeteer.launch(browserBinding);
    const page = await browser.newPage();
    await page.setViewport(DEFAULT_VIEWPORT);

    const requestUrls: string[] = [];
    page.on("request", (request) => {
      if (requestUrls.length < MAX_RECORDED_REQUESTS) requestUrls.push(request.url());
    });

    let timedOut = false;
    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: NAVIGATION_TIMEOUT_MS });
    } catch (e) {
      // Pages with long-polling/beacons never go idle; keep what loaded within the cap.
      if (!isTimeoutError(e) || requestUrls.length === 0) throw e;
      timedOut = true;
    }

    const client = await page.createCDPSession();
    const { cookies } = await client.send("Network.getAllCookies");

    return {
      finalUrl: page.url(),
      requestUrls,
      cookies: cookies.map((cookie) => ({
        name: cookie.name,
        domain: cookie.domain,
        expires: cookie.expires,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
      })),
      timedOut,
    };
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        /* ignore close errors */
      }
    }
  }
}
