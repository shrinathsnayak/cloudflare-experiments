import { describe, it, expect } from "vitest";
import { extractFirstLink, htmlToText } from "../../src/lib/text";
import { isAllowedSender, parseAllowedSenders } from "../../src/lib/senders";

describe("htmlToText", () => {
  it("strips tags, scripts, and styles", () => {
    const html = `<html><head><title>T</title><style>p{color:red}</style></head>
      <body><h1>Hello</h1><p>First&nbsp;para &amp; more</p><script>alert(1)</script>
      <ul><li>One</li><li>Two</li></ul><p>Line<br>break &#8212; &#x2603;</p></body></html>`;
    expect(htmlToText(html)).toBe("Hello\nFirst para & more\n\n- One\n- Two\nLine\nbreak — ☃");
  });

  it("drops comments and leaves unknown entities", () => {
    expect(htmlToText("<!-- hidden --><p>a &foo; b</p>")).toBe("a &foo; b");
  });
});

describe("extractFirstLink", () => {
  it("prefers anchors and skips unsubscribe links", () => {
    const html =
      '<a href="https://ex.com/unsubscribe?u=1">Unsub</a><a href="mailto:x@y.z">mail</a><a href="https://ex.com/post?a=1&amp;b=2">Read</a>';
    expect(extractFirstLink(html, "")).toBe("https://ex.com/post?a=1&b=2");
  });

  it("falls back to URLs in text", () => {
    expect(extractFirstLink(undefined, "See https://ex.com/a for more")).toBe("https://ex.com/a");
    expect(extractFirstLink(undefined, "no links")).toBeNull();
  });
});

describe("isAllowedSender", () => {
  it("accepts everyone when the list is empty", () => {
    expect(isAllowedSender(["a@b.com"], parseAllowedSenders(""))).toBe(true);
  });

  it("matches addresses and domains", () => {
    const allowed = parseAllowedSenders(" news@substack.com , @example.org, beehiiv.com ");
    expect(isAllowedSender(["NEWS@substack.com"], allowed)).toBe(true);
    expect(isAllowedSender(["other@substack.com"], allowed)).toBe(false);
    expect(isAllowedSender(["x@example.org"], allowed)).toBe(true);
    expect(isAllowedSender(["x@mail.beehiiv.com"], allowed)).toBe(true);
    expect(isAllowedSender(["me@gmail.com", "x@example.org"], allowed)).toBe(true);
    expect(isAllowedSender(["me@gmail.com", undefined], allowed)).toBe(false);
  });
});
