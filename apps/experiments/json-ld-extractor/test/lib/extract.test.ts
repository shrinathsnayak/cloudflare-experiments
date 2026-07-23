import { describe, it, expect } from "vitest";
import { extractJsonLd } from "../../src/lib/extract";

describe("extractJsonLd", () => {
  it("extracts types from ld+json blocks", () => {
    const html = `
      <script type="application/ld+json">
        {"@context":"https://schema.org","@type":"Organization","name":"Acme"}
      </script>
      <script type="application/ld+json">
        {"@context":"https://schema.org","@graph":[{"@type":"WebSite","name":"Site"}]}
      </script>
    `;
    const result = extractJsonLd("https://example.com/", html);
    expect(result.count).toBe(2);
    expect(result.types).toContain("Organization");
    expect(result.types).toContain("WebSite");
  });

  it("records parse errors for invalid JSON", () => {
    const html = `<script type="application/ld+json">{bad</script>`;
    const result = extractJsonLd("https://example.com/", html);
    expect(result.blocks[0].parseError).toBeTruthy();
  });
});
