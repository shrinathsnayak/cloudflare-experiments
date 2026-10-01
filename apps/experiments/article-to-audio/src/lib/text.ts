import { CHUNK_CHARS, MAX_CHUNKS } from "../constants/defaults";
import type { ExtractedArticle, PreparedArticle } from "../types/article";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

/** HTMLRewriter text chunks are raw HTML, so entities must be decoded manually. */
export function decodeEntities(input: string): string {
  return input.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code =
        entity[1] === "x" || entity[1] === "X"
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

/**
 * Collects readable text from HTMLRewriter callbacks. Kept free of HTMLRewriter types so it can be
 * unit-tested by replaying element/text events.
 */
export class ArticleCollector {
  private skipDepth = 0;
  private containerDepth = 0;
  private titleDepth = 0;
  private blockTags: string[] = [];
  private buffer = "";
  private titleText = "";
  private firstHeading: string | null = null;
  private containerBlocks: string[] = [];
  private allBlocks: string[] = [];

  enterSkip(): void {
    this.skipDepth++;
  }

  exitSkip(): void {
    this.skipDepth = Math.max(0, this.skipDepth - 1);
  }

  enterContainer(): void {
    this.containerDepth++;
  }

  exitContainer(): void {
    this.flush();
    this.containerDepth = Math.max(0, this.containerDepth - 1);
  }

  enterTitle(): void {
    this.titleDepth++;
  }

  exitTitle(): void {
    this.titleDepth = Math.max(0, this.titleDepth - 1);
  }

  startBlock(tag: string): void {
    if (this.skipDepth > 0) return;
    this.flush();
    this.blockTags.push(tag.toLowerCase());
  }

  endBlock(): void {
    if (this.blockTags.length === 0) return;
    this.flush();
    this.blockTags.pop();
  }

  text(chunk: string): void {
    if (this.titleDepth > 0) this.titleText += chunk;
    if (this.skipDepth > 0 || this.blockTags.length === 0) return;
    this.buffer += chunk;
  }

  private flush(): void {
    const tag = this.blockTags[this.blockTags.length - 1];
    let block = normalizeWhitespace(decodeEntities(this.buffer));
    this.buffer = "";
    if (!block || !tag) return;

    if (tag !== "p") {
      if (tag === "h1" && !this.firstHeading) this.firstHeading = block;
      if (!/[.!?:;…]$/.test(block)) block += ".";
    }
    this.allBlocks.push(block);
    if (this.containerDepth > 0) this.containerBlocks.push(block);
  }

  /** Prefers text inside <article>/<main>; falls back to every block on the page. */
  result(): ExtractedArticle {
    this.flush();
    const blocks = this.containerBlocks.length > 0 ? this.containerBlocks : this.allBlocks;
    const title = normalizeWhitespace(decodeEntities(this.titleText)) || this.firstHeading;
    return { title: title || null, text: blocks.join("\n") };
  }
}

function splitLongSentence(sentence: string, maxChars: number): string[] {
  const pieces: string[] = [];
  let current = "";
  for (const word of sentence.split(" ")) {
    for (let i = 0; i < word.length; i += maxChars) {
      const part = word.slice(i, i + maxChars);
      if (current && current.length + 1 + part.length > maxChars) {
        pieces.push(current);
        current = part;
      } else {
        current = current ? `${current} ${part}` : part;
      }
    }
  }
  if (current) pieces.push(current);
  return pieces;
}

/** Splits text into sentence-bounded chunks of at most maxChars, keeping at most maxChunks. */
export function chunkText(
  text: string,
  maxChars = CHUNK_CHARS,
  maxChunks = MAX_CHUNKS
): { chunks: string[]; truncated: boolean } {
  const input = normalizeWhitespace(text).slice(0, maxChars * maxChunks * 2);
  const segmenter = new Intl.Segmenter(undefined, { granularity: "sentence" });
  const chunks: string[] = [];
  let current = "";

  for (const { segment } of segmenter.segment(input)) {
    const sentence = segment.trim();
    if (!sentence) continue;
    const pieces = sentence.length > maxChars ? splitLongSentence(sentence, maxChars) : [sentence];

    for (const piece of pieces) {
      if (current && current.length + 1 + piece.length > maxChars) {
        chunks.push(current);
        if (chunks.length === maxChunks) return { chunks, truncated: true };
        current = piece;
      } else {
        current = current ? `${current} ${piece}` : piece;
      }
    }
  }

  if (current) chunks.push(current);
  return { chunks, truncated: input.length < normalizeWhitespace(text).length };
}

export function prepareArticle(article: ExtractedArticle): PreparedArticle {
  const { chunks, truncated } = chunkText(article.text);
  const text = chunks.join(" ");
  return { title: article.title, text, chunks, chars: text.length, truncated };
}
