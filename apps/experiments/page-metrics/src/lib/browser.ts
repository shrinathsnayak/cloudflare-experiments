import puppeteer from "@cloudflare/puppeteer";
import type { Page } from "@cloudflare/puppeteer";
import { DEFAULT_VIEWPORT, NAVIGATION_TIMEOUT_MS } from "../constants/defaults";
import type { PageMetricsResponse } from "../types/metrics";

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

export function normalizeMetrics(raw: Record<string, number>): Record<string, number> {
  const normalized: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      normalized[key] = Math.round(value * 1000) / 1000;
    }
  }
  return normalized;
}

export async function collectPageMetrics(
  browserBinding: Fetcher,
  url: string
): Promise<PageMetricsResponse> {
  const metrics = await withBrowserPage(browserBinding, url, async (page) => page.metrics());
  return {
    url,
    metrics: normalizeMetrics(metrics as Record<string, number>),
  };
}
