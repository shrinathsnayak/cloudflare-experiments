import puppeteer from "@cloudflare/puppeteer";
import type { Page } from "@cloudflare/puppeteer";
import axe from "axe-core";
import {
  AXE_TAGS,
  DEFAULT_VIEWPORT,
  MAX_ALT_IMAGES,
  MAX_AXE_ATTEMPTS,
  NAVIGATION_TIMEOUT_MS,
} from "../constants/defaults";
import type { PageAuditResult } from "../types/audit";

type AxeGlobal = {
  axe?: {
    run: (
      context: Document,
      options: { runOnly: { type: "tag"; values: string[] }; resultTypes: string[] }
    ) => Promise<{
      violations: {
        id: string;
        impact?: string | null;
        help: string;
        helpUrl: string;
        nodes: { target: (string | string[])[]; html: string }[];
      }[];
      passes: unknown[];
      incomplete: unknown[];
    }>;
  };
};

/** Returns null when `window.axe` is missing (e.g. a meta refresh reloaded the page after injection). */
async function evaluateAxe(page: Page): Promise<PageAuditResult | null> {
  // Runs inside the page: must not reference module scope (pass values as args).
  return (await page.evaluate(
    async (tags: string[], maxImages: number) => {
      const axeGlobal = (window as unknown as AxeGlobal).axe;
      if (!axeGlobal) return null;
      const results = await axeGlobal.run(document, {
        runOnly: { type: "tag", values: tags },
        resultTypes: ["violations"],
      });
      const imagesMissingAlt = Array.from(document.querySelectorAll("img"))
        .filter(
          (img) => !img.getAttribute("alt")?.trim() && img.getAttribute("role") !== "presentation"
        )
        .map((img) => img.currentSrc || img.src)
        .filter((src) => src.startsWith("http://") || src.startsWith("https://"))
        .filter((src, index, all) => all.indexOf(src) === index)
        .slice(0, maxImages);
      return {
        axe: {
          violations: results.violations.map((v) => ({
            id: v.id,
            impact: v.impact ?? null,
            help: v.help,
            helpUrl: v.helpUrl,
            nodes: v.nodes.map((n) => ({ target: n.target, html: n.html })),
          })),
          passes: results.passes.length,
          incomplete: results.incomplete.length,
        },
        imagesMissingAlt,
      };
    },
    AXE_TAGS,
    MAX_ALT_IMAGES
  )) as PageAuditResult | null;
}

/** Navigates to `url`, injects axe-core, and returns slim results plus `<img>` srcs lacking alt text. */
export async function runAxeAudit(browserBinding: Fetcher, url: string): Promise<PageAuditResult> {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  try {
    browser = await puppeteer.launch(browserBinding);
    const page = await browser.newPage();
    await page.setViewport(DEFAULT_VIEWPORT);
    // Lets the inline axe <script> run on sites whose CSP forbids inline scripts.
    await page.setBypassCSP(true);
    await page.goto(url, { waitUntil: "networkidle2", timeout: NAVIGATION_TIMEOUT_MS });

    for (let attempt = 0; attempt < MAX_AXE_ATTEMPTS; attempt++) {
      // axe.source is axe's bundled function stringified; wrangler.json sets keep_names: false
      // so esbuild doesn't inject __name() calls into it that are undefined in the page.
      await page.addScriptTag({ content: axe.source });
      const result = await evaluateAxe(page);
      if (result) return result;
    }
    throw new Error("axe-core could not be loaded into the page");
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
