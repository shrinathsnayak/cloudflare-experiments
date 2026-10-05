import type { TagItem } from "fumadocs-ui/contexts/search";

/** Primary filter chips for the search dialog (match first-class experiment tags). */
export const searchTags: TagItem[] = [
  { name: "AI", value: "ai" },
  { name: "Agents", value: "agents" },
  { name: "Scraping", value: "scraping" },
  { name: "Browser", value: "browser" },
  { name: "Network", value: "network" },
  { name: "Edge", value: "edge" },
  { name: "Storage", value: "storage" },
  { name: "Stateful", value: "stateful" },
  { name: "Security", value: "security" },
  { name: "Email", value: "email" },
  { name: "SEO", value: "seo" },
  { name: "Containers", value: "containers" },
];

/**
 * Exclusive category tags. Only the first matching frontmatter tag is used for
 * Orama filters so SEO/discoverability keywords (e.g. "scraping" on an AI page)
 * do not make category chips return unrelated experiments.
 */
const categoryFilterTags = new Set([
  "ai",
  "scraping",
  "browser",
  "network",
  "edge",
  "storage",
  "stateful",
  "containers",
  "email",
]);

/** Cross-cutting chips that may appear alongside a category. */
const crossCuttingFilterTags = new Set(["agents", "security", "seo"]);

/**
 * Map frontmatter tags → search filter tags.
 * Keeps full `tags` in MDX for SEO/keywords while narrowing what chips match.
 */
export function toSearchFilterTags(pageTags: string[]): string[] {
  const tags: string[] = [];
  const primary = pageTags.find((tag) => categoryFilterTags.has(tag));
  if (primary) tags.push(primary);

  for (const tag of pageTags) {
    if (crossCuttingFilterTags.has(tag) && !tags.includes(tag)) {
      tags.push(tag);
    }
  }

  return tags;
}
