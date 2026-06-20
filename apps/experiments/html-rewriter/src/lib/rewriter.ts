import type { HtmlStats } from "../types/rewrite";
import { DEFAULT_BANNER } from "../constants/defaults";

class StatsCollector {
  stats: HtmlStats = {
    title: null,
    linkCount: 0,
    imageCount: 0,
    headingCounts: {},
  };

  title = {
    element: (element: Element) => {
      element.onEndTag(() => {
        // title text collected via text handler below
      });
    },
    text: (text: Text) => {
      const chunk = text.text.trim();
      if (chunk) {
        this.stats.title = this.stats.title ? `${this.stats.title}${chunk}` : chunk;
      }
    },
  };

  link = {
    element: () => {
      this.stats.linkCount++;
    },
  };

  image = {
    element: () => {
      this.stats.imageCount++;
    },
  };

  heading = (tag: string) => ({
    element: () => {
      this.stats.headingCounts[tag] = (this.stats.headingCounts[tag] ?? 0) + 1;
    },
  });
}

class BannerInjector {
  constructor(private banner: string) {}

  body = {
    element: (element: Element) => {
      element.prepend(
        `<div style="background:#f48120;color:#fff;padding:8px 12px;font-family:sans-serif;font-size:14px;">${escapeHtml(this.banner)}</div>`,
        { html: true }
      );
    },
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function extractHtmlStats(html: string): Promise<HtmlStats> {
  const collector = new StatsCollector();
  const rewriter = new HTMLRewriter()
    .on("title", collector.title)
    .on("a", collector.link)
    .on("img", collector.image)
    .on("h1", collector.heading("h1"))
    .on("h2", collector.heading("h2"))
    .on("h3", collector.heading("h3"))
    .on("h4", collector.heading("h4"))
    .on("h5", collector.heading("h5"))
    .on("h6", collector.heading("h6"));

  await rewriter.transform(new Response(html)).text();
  return collector.stats;
}

export async function transformHtmlAsync(html: string, banner = DEFAULT_BANNER): Promise<string> {
  const injector = new BannerInjector(banner);
  const transformed = new HTMLRewriter().on("body", injector.body).transform(new Response(html));
  return transformed.text();
}
