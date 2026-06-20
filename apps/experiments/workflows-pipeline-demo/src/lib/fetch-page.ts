import { MAX_TEXT_CHARS } from "../constants/defaults";
import type { FetchedPage } from "../types/workflow";

const TITLE_RE = /<title[^>]*>([^<]*)<\/title>/i;
const TAG_RE = /<[^>]+>/g;

function extractTitle(html: string): string | null {
  const match = html.match(TITLE_RE);
  return match?.[1]?.trim() ?? null;
}

function extractText(html: string): string {
  const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, " ");
  const withoutStyles = withoutScripts.replace(/<style[\s\S]*?<\/style>/gi, " ");
  const text = withoutStyles.replace(TAG_RE, " ").replace(/\s+/g, " ").trim();
  return text.slice(0, MAX_TEXT_CHARS);
}

export async function fetchPage(url: string): Promise<FetchedPage> {
  const response = await fetch(url, {
    headers: { "User-Agent": "cloudflare-experiments/workflows-pipeline-demo" },
  });
  if (!response.ok) {
    throw new Error(`Fetch failed with status ${response.status}`);
  }
  const html = await response.text();
  return {
    url,
    title: extractTitle(html),
    text: extractText(html),
  };
}
