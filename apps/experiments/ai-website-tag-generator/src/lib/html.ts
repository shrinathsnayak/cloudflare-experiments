export function getTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/<[^>]+>/g, "").trim() || null : null;
}

/** Strip tags and collapse whitespace for plain text. */
export function getBodyText(html: string, maxChars: number): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const fragment = bodyMatch ? bodyMatch[1] : html;
  const text = fragment
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxChars ? text.slice(0, maxChars) + "..." : text;
}
