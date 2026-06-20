import puppeteer from "@cloudflare/puppeteer";
import type { Page } from "@cloudflare/puppeteer";
import { DEFAULT_VIEWPORT, NAVIGATION_TIMEOUT_MS } from "../constants/defaults";
import { buildExtractResponse } from "./readability";
import type { RawReadabilityContent } from "../types/extract";
import type { ReadabilityExtractResponse } from "../types/extract";

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

export async function extractReadableContent(
  browserBinding: Fetcher,
  url: string
): Promise<ReadabilityExtractResponse> {
  const raw = await withBrowserPage(browserBinding, url, async (page) => {
    return page.evaluate((): RawReadabilityContent => {
      const removeSelectors = [
        "script",
        "style",
        "noscript",
        "nav",
        "footer",
        "aside",
        "iframe",
        "svg",
        "[aria-hidden='true']",
        ".sidebar",
        ".advertisement",
        ".ad",
        ".comments",
        ".comment",
        ".social-share",
        ".newsletter",
        ".cookie-banner",
      ];

      const authorMeta =
        document.querySelector('meta[name="author"]')?.getAttribute("content") ??
        document.querySelector('meta[property="article:author"]')?.getAttribute("content") ??
        document.querySelector('meta[property="og:article:author"]')?.getAttribute("content") ??
        document.querySelector("[rel='author']")?.textContent ??
        null;

      const title =
        document.querySelector('meta[property="og:title"]')?.getAttribute("content")?.trim() ||
        document.title.trim();

      const candidateSelectors = [
        "article",
        "main",
        "[role='main']",
        ".post-content",
        ".article-body",
        ".entry-content",
        ".article-content",
        "#content",
        ".content",
      ];

      let contentRoot: Element = document.body;
      let bestScore = 0;

      for (const selector of candidateSelectors) {
        const elements = Array.from(document.querySelectorAll(selector));
        for (const element of elements) {
          const textLength = element.textContent?.replace(/\s+/g, " ").trim().length ?? 0;
          const paragraphCount = element.querySelectorAll("p").length;
          const score = textLength + paragraphCount * 120;
          if (score > bestScore) {
            bestScore = score;
            contentRoot = element;
          }
        }
      }

      if (bestScore === 0) {
        const paragraphs = Array.from(document.querySelectorAll("p"));
        let bestParagraphGroup: Element = document.body;
        let groupScore = 0;
        for (const paragraph of paragraphs) {
          const parent = paragraph.parentElement;
          if (!parent) continue;
          const score = parent.textContent?.replace(/\s+/g, " ").trim().length ?? 0;
          if (score > groupScore) {
            groupScore = score;
            bestParagraphGroup = parent;
          }
        }
        contentRoot = bestParagraphGroup;
      }

      const clone = contentRoot.cloneNode(true) as HTMLElement;
      for (const selector of removeSelectors) {
        clone.querySelectorAll(selector).forEach((node: Element) => node.remove());
      }

      const body = clone.innerText.replace(/\s+/g, " ").trim();

      return {
        title,
        author: authorMeta?.trim() || null,
        body,
      };
    });
  });

  return buildExtractResponse(url, raw);
}
