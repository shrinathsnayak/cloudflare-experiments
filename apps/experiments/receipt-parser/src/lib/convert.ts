import type { UploadedFile } from "../types/receipt";

/** Converts a PDF or image to Markdown with Workers AI Markdown Conversion. */
export async function convertToMarkdown(ai: Ai, file: UploadedFile): Promise<string> {
  const result = await ai.toMarkdown(
    { name: file.name, blob: new Blob([file.data], { type: file.mimeType }) },
    { conversionOptions: { pdf: { metadata: false } } }
  );
  if (result.format === "error") {
    throw new Error(result.error || "Markdown conversion failed");
  }
  const markdown = result.data.trim();
  if (!markdown) {
    throw new Error("No text could be extracted from the file");
  }
  return markdown;
}
