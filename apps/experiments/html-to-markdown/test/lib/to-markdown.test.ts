import { describe, it, expect } from "vitest";
import { htmlToMarkdown } from "../../src/lib/to-markdown";

describe("htmlToMarkdown", () => {
  it("converts headings, paragraphs, and emphasis", () => {
    const html = `
      <html><head><title>Demo Page</title></head>
      <body>
        <h1>Hello</h1>
        <p>This is <strong>bold</strong> and <em>italic</em>.</p>
      </body></html>
    `;
    const result = htmlToMarkdown("https://example.com/", html);
    expect(result.title).toBe("Demo Page");
    expect(result.markdown).toContain("# Hello");
    expect(result.markdown).toContain("**bold**");
    expect(result.markdown).toContain("*italic*");
  });

  it("converts links and images with resolved URLs", () => {
    const html = `
      <body>
        <p><a href="/about">About</a></p>
        <p><img src="/logo.png" alt="Logo" /></p>
      </body>
    `;
    const result = htmlToMarkdown("https://example.com/page", html);
    expect(result.markdown).toContain("[About](https://example.com/about)");
    expect(result.markdown).toContain("![Logo](https://example.com/logo.png)");
  });

  it("converts lists and code", () => {
    const html = `
      <body>
        <ul><li>One</li><li>Two</li></ul>
        <ol><li>First</li><li>Second</li></ol>
        <p>Use <code>fetch</code>.</p>
        <pre><code>const x = 1;</code></pre>
      </body>
    `;
    const result = htmlToMarkdown("https://example.com/", html);
    expect(result.markdown).toContain("- One");
    expect(result.markdown).toContain("1. First");
    expect(result.markdown).toContain("`fetch`");
    expect(result.markdown).toContain("```");
    expect(result.markdown).toContain("const x = 1;");
  });

  it("prefers article content over chrome", () => {
    const html = `
      <body>
        <nav><a href="/">Home</a></nav>
        <article>
          <h2>Article Title</h2>
          <p>Article body.</p>
        </article>
        <footer>Footer</footer>
      </body>
    `;
    const result = htmlToMarkdown("https://example.com/", html);
    expect(result.markdown).toContain("## Article Title");
    expect(result.markdown).toContain("Article body.");
    expect(result.markdown).not.toContain("Footer");
  });

  it("skips script and style content", () => {
    const html = `
      <body>
        <style>.x { color: red; }</style>
        <script>alert(1)</script>
        <p>Visible</p>
      </body>
    `;
    const result = htmlToMarkdown("https://example.com/", html);
    expect(result.markdown).toContain("Visible");
    expect(result.markdown).not.toContain("alert");
    expect(result.markdown).not.toContain("color: red");
  });
});
