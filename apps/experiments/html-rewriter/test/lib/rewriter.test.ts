import { describe, it, expect, beforeAll } from "vitest";

type Handler = {
  element?: (element: MockElement) => void;
  text?: (text: { text: string }) => void;
};

class MockElement {
  constructor(private tag: string) {}
  onEndTag(_cb: () => void) {}
  prepend(content: string, _opts?: { html?: boolean }) {
    if (this.tag === "body") {
      MockHTMLRewriter.lastBodyPrepend = content;
    }
  }
}

class MockHTMLRewriter {
  static lastBodyPrepend = "";
  private handlers = new Map<string, Handler>();

  on(selector: string, handler: Handler) {
    this.handlers.set(selector, handler);
    return this;
  }

  transform(response: Response): Response {
    return {
      text: async () => {
        const html = await response.text();
        return MockHTMLRewriter.applyHandlers(html, this.handlers);
      },
    } as Response;
  }

  static applyHandlers(html: string, handlers: Map<string, Handler>): string {
    let out = html;
    MockHTMLRewriter.lastBodyPrepend = "";

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const titleHandler = handlers.get("title");
    if (titleHandler?.text && titleMatch) {
      titleHandler.text({ text: titleMatch[1].replace(/<[^>]+>/g, "") });
    }

    for (const tag of ["a", "img", "h1", "h2", "h3", "h4", "h5", "h6"]) {
      const handler = handlers.get(tag);
      if (handler?.element) {
        const re = new RegExp(`<${tag}[\\s>]`, "gi");
        const matches = html.match(re);
        for (let i = 0; i < (matches?.length ?? 0); i++) {
          handler.element(new MockElement(tag));
        }
      }
    }

    const bodyHandler = handlers.get("body");
    if (bodyHandler?.element) {
      bodyHandler.element(new MockElement("body"));
      if (MockHTMLRewriter.lastBodyPrepend) {
        out = out.replace(/<body([^>]*)>/i, `<body$1>${MockHTMLRewriter.lastBodyPrepend}`);
      }
    }

    return out;
  }
}

beforeAll(() => {
  (globalThis as { HTMLRewriter?: typeof MockHTMLRewriter }).HTMLRewriter =
    MockHTMLRewriter as unknown as typeof HTMLRewriter;
});

describe("rewriter", () => {
  it("extracts title and element counts", async () => {
    const { extractHtmlStats } = await import("../../src/lib/rewriter");
    const html = `<html><head><title>Hello</title></head><body><h1>One</h1><a href="/">Link</a><img src="/x.png"/></body></html>`;
    const stats = await extractHtmlStats(html);
    expect(stats.title).toBe("Hello");
    expect(stats.linkCount).toBe(1);
    expect(stats.imageCount).toBe(1);
    expect(stats.headingCounts.h1).toBe(1);
  });

  it("injects a banner into body", async () => {
    const { transformHtmlAsync } = await import("../../src/lib/rewriter");
    const html = `<html><body><p>Content</p></body></html>`;
    const out = await transformHtmlAsync(html, "Edge banner");
    expect(out).toContain("Edge banner");
    expect(out).toContain("Content");
  });
});
