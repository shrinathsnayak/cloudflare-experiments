import { Hono } from "hono";
import puppeteer from "@cloudflare/puppeteer";
import type { Env } from "../types/env";
import type { InspectResult } from "../types/inspect";
import { DEFAULT_VIEWPORT, NAVIGATION_TIMEOUT_MS } from "../constants/defaults";
import { validateUrl } from "../lib/url";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/inspect", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  try {
    browser = await puppeteer.launch(c.env.BROWSER);
    const page = await browser.newPage();
    await page.setViewport(DEFAULT_VIEWPORT);
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: NAVIGATION_TIMEOUT_MS,
    });

    const title = await page.title();
    const pageUrl = page.url();
    const cookies = await page.cookies();
    const metrics = (await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      return {
        documentTitle: document.title,
        userAgent: navigator.userAgent,
        domContentLoaded: nav?.domContentLoadedEventEnd,
      };
    })) as {
      documentTitle: string;
      userAgent: string;
      domContentLoaded?: number;
    };

    const result: InspectResult = {
      title,
      url: pageUrl,
      cookiesCount: cookies.length,
      documentTitle: metrics.documentTitle,
      performance: {
        ...(typeof metrics.domContentLoaded === "number"
          ? { domContentLoaded: metrics.domContentLoaded }
          : {}),
      },
      userAgent: metrics.userAgent,
    };

    await browser.close();
    browser = null;
    return jsonSuccess(c, result);
  } catch (e) {
    if (browser) {
      try {
        await browser.close();
      } catch {
        /* ignore */
      }
    }
    const message = e instanceof Error ? e.message : "Inspect failed";
    return jsonError(c, message, "INSPECT_ERROR", 502);
  }
});

export default app;
