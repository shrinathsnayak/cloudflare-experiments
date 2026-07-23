import { describe, it, expect } from "vitest";
import { parseFeedXml } from "../../src/lib/parse";

const rss = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Example RSS</title>
    <link>https://example.com/</link>
    <description>Demo feed</description>
    <item>
      <title>Hello</title>
      <link>https://example.com/hello</link>
      <guid>https://example.com/hello</guid>
      <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
      <description>First post</description>
    </item>
  </channel>
</rss>`;

const atom = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/atom">
  <title>Example Atom</title>
  <link href="https://example.com/"/>
  <subtitle>Demo atom</subtitle>
  <entry>
    <title>World</title>
    <link href="https://example.com/world"/>
    <id>urn:uuid:1</id>
    <updated>2024-01-01T00:00:00Z</updated>
    <summary>Second post</summary>
  </entry>
</feed>`;

describe("parseFeedXml", () => {
  it("parses RSS", () => {
    const feed = parseFeedXml("https://example.com/rss.xml", rss);
    expect(feed.format).toBe("rss");
    expect(feed.title).toBe("Example RSS");
    expect(feed.items).toHaveLength(1);
    expect(feed.items[0].title).toBe("Hello");
    expect(feed.items[0].link).toBe("https://example.com/hello");
  });

  it("parses Atom", () => {
    const feed = parseFeedXml("https://example.com/atom.xml", atom);
    expect(feed.format).toBe("atom");
    expect(feed.title).toBe("Example Atom");
    expect(feed.items[0].link).toBe("https://example.com/world");
  });

  it("returns unknown for non-feed XML", () => {
    const feed = parseFeedXml("https://example.com/x", "<html></html>");
    expect(feed.format).toBe("unknown");
    expect(feed.itemCount).toBe(0);
  });
});
