import puppeteer from "@cloudflare/puppeteer";
import type { Page } from "@cloudflare/puppeteer";
import { DEFAULT_VIEWPORT, NAVIGATION_TIMEOUT_MS } from "../constants/defaults";
import { normalizeTitle, truncateText } from "./text";
import type { RenderedTextResponse } from "../types/text";

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

export async function extractRenderedText(
  browserBinding: Fetcher,
  url: string
): Promise<RenderedTextResponse> {
  const raw = await withBrowserPage(browserBinding, url, async (page) => {
    const title = await page.title();
    const text = await page.$eval("body", (body) => body.innerText ?? "");
    return { title, text };
  });

  const title = normalizeTitle(raw.title);
  const { text, truncated } = truncateText(raw.text);

  return {
    url,
    title,
    text,
    textLength: text.length,
    truncated,
  };
}
