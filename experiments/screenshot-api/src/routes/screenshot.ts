import { Hono } from "hono";
import puppeteer from "@cloudflare/puppeteer";
import type { Env } from "../types/env";
import { validateUrl } from "../lib/url";
import { jsonError } from "../utils/response";
import { DEFAULT_VIEWPORT, NAVIGATION_TIMEOUT_MS } from "../constants/defaults";

const app = new Hono<{ Bindings: Env }>();

app.get("/screenshot", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  try {
    browser = await puppeteer.launch(c.env.BROWSER);
    const page = await browser.newPage();
    await page.setViewport(DEFAULT_VIEWPORT);
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: NAVIGATION_TIMEOUT_MS,
    });
    const png = await page.screenshot({ type: "png" });
    await browser.close();
    browser = null;

    return new Response(png, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (e) {
    if (browser)
      try {
        await browser.close();
      } catch {
        /* ignore */
      }
    const message = e instanceof Error ? e.message : "Screenshot failed";
    return jsonError(c, message, "SCREENSHOT_ERROR", 502);
  }
});

export default app;
