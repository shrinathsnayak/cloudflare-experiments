import { MAX_DIFF_PREVIEW_LINES } from "../constants/defaults";

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeLines(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function summarizeDiff(previousText: string | null, currentText: string): string {
  if (previousText === null) {
    return "Initial snapshot";
  }

  if (normalizeText(previousText) === normalizeText(currentText)) {
    return "No visible text changes";
  }

  const previousLines = normalizeLines(previousText);
  const currentLines = normalizeLines(currentText);
  const previousSet = new Set(previousLines);
  const currentSet = new Set(currentLines);

  const added = currentLines.filter((line) => !previousSet.has(line));
  const removed = previousLines.filter((line) => !currentSet.has(line));

  if (added.length === 0 && removed.length === 0) {
    return "No visible text changes";
  }

  const parts: string[] = [];
  if (added.length > 0) {
    parts.push(`+${added.length} line${added.length === 1 ? "" : "s"}`);
  }
  if (removed.length > 0) {
    parts.push(`-${removed.length} line${removed.length === 1 ? "" : "s"}`);
  }

  const previewAdded = added.slice(0, MAX_DIFF_PREVIEW_LINES).map((line) => `+ ${line}`);
  const previewRemoved = removed.slice(0, MAX_DIFF_PREVIEW_LINES).map((line) => `- ${line}`);
  const preview = [...previewRemoved, ...previewAdded].join("\n");

  return preview ? `${parts.join(", ")}. Preview:\n${preview}` : parts.join(", ");
}
