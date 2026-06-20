import puppeteer from "@cloudflare/puppeteer";
import type { Page } from "@cloudflare/puppeteer";
import { DEFAULT_VIEWPORT, NAVIGATION_TIMEOUT_MS } from "../constants/defaults";

export async function withBrowserPage<T>(
  browserBinding: Fetcher,
  url: string,
  fn: (page: Page) => Promise<T>
): Promise<T> {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  try {
    browser = await puppeteer.launch(browserBinding);
    const page = await browser.newPage();
    await page.setViewport(DEFAULT_VIEWPORT);
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: NAVIGATION_TIMEOUT_MS,
    });
    return await fn(page);
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

export async function generatePdf(browserBinding: Fetcher, url: string): Promise<Uint8Array> {
  return withBrowserPage(browserBinding, url, async (page) => {
    const pdf = await page.pdf({ printBackground: true });
    return new Uint8Array(pdf);
  });
}
