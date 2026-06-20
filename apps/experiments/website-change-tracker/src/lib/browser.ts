import puppeteer from "@cloudflare/puppeteer";
import type { Page } from "@cloudflare/puppeteer";
import { DEFAULT_VIEWPORT, MAX_TEXT_LENGTH, NAVIGATION_TIMEOUT_MS } from "../constants/defaults";

function truncateText(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= MAX_TEXT_LENGTH) {
    return normalized;
  }
  return normalized.slice(0, MAX_TEXT_LENGTH);
}

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
): Promise<{ title: string; text: string }> {
  const raw = await withBrowserPage(browserBinding, url, async (page) => {
    const title = (await page.title()).trim();
    const text = await page.$eval("body", (body) => body.innerText ?? "");
    return { title, text };
  });

  const title = raw.title || url;
  const text = truncateText(raw.text);
  return { title, text: `${title}\n\n${text}` };
}
