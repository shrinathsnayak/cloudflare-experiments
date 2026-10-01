import {
  BLOCK_SELECTOR,
  CONTAINER_SELECTOR,
  FETCH_TIMEOUT_MS,
  SKIP_SELECTOR,
  USER_AGENT,
} from "../constants/defaults";
import type { ExtractedArticle } from "../types/article";
import { ArticleCollector } from "./text";

export class NotHtmlError extends Error {}

/** Runs `exit` at the element's end tag, or immediately for elements that have none (e.g. <svg/>). */
function scoped(element: Element, enter: () => void, exit: () => void): void {
  enter();
  try {
    element.onEndTag(exit);
  } catch {
    exit();
  }
}

/** Fetches a page and streams it through HTMLRewriter to collect readable article text. */
export async function fetchArticle(url: string): Promise<ExtractedArticle> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
    redirect: "follow",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`Upstream responded with HTTP ${res.status}`);
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (!/html/i.test(contentType)) {
    throw new NotHtmlError(
      `Expected an HTML page but got ${contentType || "unknown content type"}`
    );
  }

  const collector = new ArticleCollector();
  const rewriter = new HTMLRewriter()
    .on(SKIP_SELECTOR, {
      element: (el) =>
        scoped(
          el,
          () => collector.enterSkip(),
          () => collector.exitSkip()
        ),
    })
    .on(CONTAINER_SELECTOR, {
      element: (el) =>
        scoped(
          el,
          () => collector.enterContainer(),
          () => collector.exitContainer()
        ),
    })
    .on("title", {
      element: (el) =>
        scoped(
          el,
          () => collector.enterTitle(),
          () => collector.exitTitle()
        ),
    })
    .on(BLOCK_SELECTOR, {
      element: (el) =>
        scoped(
          el,
          () => collector.startBlock(el.tagName),
          () => collector.endBlock()
        ),
    })
    .onDocument({ text: (chunk) => collector.text(chunk.text) });

  await rewriter.transform(res).arrayBuffer();
  return collector.result();
}
