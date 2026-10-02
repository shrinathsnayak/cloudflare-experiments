import { describe, it, expect } from "vitest";
import { ArticleCollector, chunkText, decodeEntities, prepareArticle } from "../../src/lib/text";

type Event =
  | ["skip" | "container" | "title" | "block", string?]
  | ["end-skip" | "end-container" | "end-title" | "end-block"]
  | ["text", string];

/** Replays the callbacks HTMLRewriter would fire for a document. */
function replay(events: Event[]) {
  const collector = new ArticleCollector();
  for (const [type, arg] of events) {
    if (type === "skip") collector.enterSkip();
    else if (type === "end-skip") collector.exitSkip();
    else if (type === "container") collector.enterContainer();
    else if (type === "end-container") collector.exitContainer();
    else if (type === "title") collector.enterTitle();
    else if (type === "end-title") collector.exitTitle();
    else if (type === "block") collector.startBlock(arg ?? "p");
    else if (type === "end-block") collector.endBlock();
    else collector.text(arg ?? "");
  }
  return collector.result();
}

describe("decodeEntities", () => {
  it("decodes named and numeric entities", () => {
    expect(decodeEntities("Fish &amp; chips &#8212; &#x27;tasty&#x27; &hellip;")).toBe(
      "Fish & chips — 'tasty' …"
    );
    expect(decodeEntities("&unknown; stays")).toBe("&unknown; stays");
  });
});

describe("ArticleCollector", () => {
  it("prefers <article> text and skips nav/script", () => {
    const article = replay([
      ["title"],
      ["text", "My Blog &amp; Notes"],
      ["end-title"],
      ["skip"],
      ["block", "p"],
      ["text", "Home About"],
      ["end-block"],
      ["end-skip"],
      ["block", "p"],
      ["text", "Cookie banner outside the article."],
      ["end-block"],
      ["container"],
      ["block", "h1"],
      ["text", "Hello World"],
      ["end-block"],
      ["block", "p"],
      ["text", "First "],
      ["text", "paragraph."],
      ["end-block"],
      ["skip"],
      ["text", "var x = 1;"],
      ["end-skip"],
      ["block", "h2"],
      ["text", "Section?"],
      ["end-block"],
      ["end-container"],
    ]);
    expect(article.title).toBe("My Blog & Notes");
    expect(article.text).toBe("Hello World.\nFirst paragraph.\nSection?");
  });

  it("falls back to all blocks and first h1 when there is no container or title", () => {
    const article = replay([
      ["block", "h1"],
      ["text", "Headline"],
      ["end-block"],
      ["block", "p"],
      ["text", "  Body\n text  "],
      ["end-block"],
    ]);
    expect(article.title).toBe("Headline");
    expect(article.text).toBe("Headline.\nBody text");
  });

  it("ignores text outside blocks", () => {
    expect(replay([["text", "loose text"]]).text).toBe("");
  });
});

describe("chunkText", () => {
  it("keeps sentences together within the limit", () => {
    const { chunks, truncated } = chunkText("One two. Three four. Five six.", 20, 6);
    expect(chunks).toEqual(["One two. Three four.", "Five six."]);
    expect(truncated).toBe(false);
  });

  it("caps the number of chunks and reports truncation", () => {
    const text = Array.from({ length: 20 }, (_, i) => `Sentence number ${i}.`).join(" ");
    const { chunks, truncated } = chunkText(text, 40, 3);
    expect(chunks).toHaveLength(3);
    expect(chunks.every((chunk) => chunk.length <= 40)).toBe(true);
    expect(truncated).toBe(true);
  });

  it("splits sentences longer than the limit on word boundaries", () => {
    const { chunks } = chunkText("alpha beta gamma delta epsilon", 12, 6);
    expect(chunks).toEqual(["alpha beta", "gamma delta", "epsilon"]);
  });
});

describe("prepareArticle", () => {
  it("returns joined text, char count, and chunks", () => {
    const article = prepareArticle({ title: "T", text: "Hello there.\nGeneral Kenobi." });
    expect(article.text).toBe("Hello there. General Kenobi.");
    expect(article.chars).toBe(article.text.length);
    expect(article.chunks).toEqual(["Hello there. General Kenobi."]);
  });
});
