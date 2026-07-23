import { MAX_MARKDOWN_CHARS } from "../constants/defaults";
import type { MarkdownResponse } from "../types/markdown";
import { resolveUrl } from "./url";

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const SKIP_TAGS = new Set([
  "script",
  "style",
  "noscript",
  "svg",
  "iframe",
  "canvas",
  "template",
  "head",
]);

const BLOCK_TAGS = new Set([
  "address",
  "article",
  "aside",
  "blockquote",
  "div",
  "dl",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "li",
  "main",
  "nav",
  "ol",
  "p",
  "pre",
  "section",
  "table",
  "ul",
]);

type AttrMap = Record<string, string>;

type OpenToken = { kind: "open"; tag: string; attrs: AttrMap };
type CloseToken = { kind: "close"; tag: string };
type TextToken = { kind: "text"; value: string };
type Token = OpenToken | CloseToken | TextToken;

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n: string) => {
      const code = Number(n);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => {
      const code = Number.parseInt(h, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    });
}

function parseAttrs(raw: string): AttrMap {
  const attrs: AttrMap = {};
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    const name = m[1].toLowerCase();
    if (name === "/" || name.startsWith("!")) continue;
    attrs[name] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return attrs;
}

function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  const re = /<!--[\s\S]*?-->|<\/?([a-zA-Z][\w:-]*)\b([^>]*)>|([^<]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const full = m[0];
    if (full.startsWith("<!--")) continue;
    if (m[1]) {
      const tag = m[1].toLowerCase();
      const isClose = full.startsWith("</");
      if (isClose) {
        tokens.push({ kind: "close", tag });
      } else {
        const attrs = parseAttrs(m[2] ?? "");
        const selfClosing = full.endsWith("/>") || VOID_TAGS.has(tag);
        tokens.push({ kind: "open", tag, attrs });
        if (selfClosing) tokens.push({ kind: "close", tag });
      }
    } else if (m[3] !== undefined) {
      tokens.push({ kind: "text", value: decodeEntities(m[3]) });
    }
  }
  return tokens;
}

function getTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return null;
  const title = decodeEntities(m[1].replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
  return title || null;
}

function extractContentHtml(html: string): string {
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1];
  if (article) return article;
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (main) return main;
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  return body ?? html;
}

function escapeMdLinkText(text: string): string {
  return text.replace(/[\[\]]/g, "\\$&");
}

function collapseBlankLines(md: string): string {
  return md
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function convertTokens(tokens: Token[], baseUrl: string): string {
  let out = "";
  let i = 0;
  let listDepth = 0;
  let orderedStack: boolean[] = [];
  let olCounters: number[] = [];
  let skipDepth = 0;
  let inPre = false;
  let inCode = false;
  let linkHref: string | null = null;
  let linkText = "";

  const pushBlock = (chunk: string) => {
    if (!chunk) return;
    if (out && !out.endsWith("\n\n") && !out.endsWith("\n")) out += "\n\n";
    else if (out && out.endsWith("\n") && !out.endsWith("\n\n")) out += "\n";
    out += chunk;
  };

  const pushInline = (chunk: string) => {
    if (!chunk) return;
    out += chunk;
  };

  const ensureNewline = () => {
    if (out && !out.endsWith("\n")) out += "\n";
  };

  while (i < tokens.length) {
    const token = tokens[i];

    if (token.kind === "open" && SKIP_TAGS.has(token.tag)) {
      skipDepth = 1;
      i += 1;
      while (i < tokens.length && skipDepth > 0) {
        const t = tokens[i];
        if (t.kind === "open" && t.tag === token.tag) skipDepth += 1;
        if (t.kind === "close" && t.tag === token.tag) skipDepth -= 1;
        i += 1;
      }
      continue;
    }

    if (token.kind === "text") {
      if (linkHref !== null) {
        linkText += token.value;
      } else if (inPre || inCode) {
        pushInline(token.value);
      } else {
        const text = token.value.replace(/\s+/g, " ");
        if (text) pushInline(text);
      }
      i += 1;
      continue;
    }

    if (token.kind === "open") {
      const { tag, attrs } = token;

      if (tag === "br") {
        pushInline("  \n");
      } else if (tag === "hr") {
        pushBlock("---");
      } else if (tag === "img") {
        const alt = attrs.alt ?? "";
        const src = attrs.src ? resolveUrl(baseUrl, attrs.src) : "";
        if (src) pushInline(`![${escapeMdLinkText(alt)}](${src})`);
      } else if (/^h[1-6]$/.test(tag)) {
        const level = Number(tag[1]);
        ensureNewline();
        if (out && !out.endsWith("\n\n")) out += "\n";
        pushInline(`${"#".repeat(level)} `);
      } else if (tag === "p") {
        ensureNewline();
        if (out && !out.endsWith("\n\n")) out += "\n";
      } else if (tag === "blockquote") {
        ensureNewline();
        if (out && !out.endsWith("\n\n")) out += "\n";
        pushInline("> ");
      } else if (tag === "pre") {
        inPre = true;
        pushBlock("```\n");
      } else if (tag === "code") {
        if (!inPre) {
          inCode = true;
          pushInline("`");
        }
      } else if (tag === "strong" || tag === "b") {
        pushInline("**");
      } else if (tag === "em" || tag === "i") {
        pushInline("*");
      } else if (tag === "a") {
        linkHref = attrs.href ? resolveUrl(baseUrl, attrs.href) : "";
        linkText = "";
      } else if (tag === "ul") {
        listDepth += 1;
        orderedStack.push(false);
        ensureNewline();
      } else if (tag === "ol") {
        listDepth += 1;
        orderedStack.push(true);
        olCounters.push(0);
        ensureNewline();
      } else if (tag === "li") {
        ensureNewline();
        const indent = "  ".repeat(Math.max(0, listDepth - 1));
        const ordered = orderedStack[orderedStack.length - 1] === true;
        if (ordered) {
          olCounters[olCounters.length - 1] += 1;
          pushInline(`${indent}${olCounters[olCounters.length - 1]}. `);
        } else {
          pushInline(`${indent}- `);
        }
      } else if (BLOCK_TAGS.has(tag)) {
        ensureNewline();
      }

      i += 1;
      continue;
    }

    // close
    const { tag } = token;
    if (tag === "pre") {
      inPre = false;
      if (!out.endsWith("\n")) out += "\n";
      out += "```";
      out += "\n\n";
    } else if (tag === "code") {
      if (!inPre && inCode) {
        inCode = false;
        pushInline("`");
      }
    } else if (tag === "strong" || tag === "b") {
      pushInline("**");
    } else if (tag === "em" || tag === "i") {
      pushInline("*");
    } else if (tag === "a") {
      const text = escapeMdLinkText(linkText.replace(/\s+/g, " ").trim() || linkHref || "");
      if (linkHref) pushInline(`[${text}](${linkHref})`);
      else pushInline(text);
      linkHref = null;
      linkText = "";
    } else if (tag === "ul" || tag === "ol") {
      listDepth = Math.max(0, listDepth - 1);
      orderedStack.pop();
      if (tag === "ol") olCounters.pop();
      out += "\n";
    } else if (tag === "li" || tag === "p" || /^h[1-6]$/.test(tag) || tag === "blockquote") {
      out += "\n\n";
    } else if (BLOCK_TAGS.has(tag)) {
      out += "\n";
    }

    i += 1;
  }

  return collapseBlankLines(out);
}

/**
 * Convert HTML to Markdown, preferring article/main/body content.
 */
export function htmlToMarkdown(url: string, html: string): MarkdownResponse {
  const title = getTitle(html);
  const content = extractContentHtml(html);
  const tokens = tokenize(content);
  let markdown = convertTokens(tokens, url);
  if (markdown.length > MAX_MARKDOWN_CHARS) {
    markdown = markdown.slice(0, MAX_MARKDOWN_CHARS) + "\n\n…";
  }
  return { url, title, markdown };
}
