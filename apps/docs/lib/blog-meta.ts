import type { BlogCover } from "@/lib/blog-covers";
import { blogsRoute, docsRoute } from "@/lib/shared";

export type BlogRelatedExperiment = {
  slug: string;
  title: string;
  blurb: string;
};

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  keywords: string[];
  readingMinutes: number;
  featured: boolean;
  relatedExperiments: BlogRelatedExperiment[];
  url: string;
  cover?: BlogCover;
};

export function blogPostPath(slug: string): string {
  return `${blogsRoute}/${slug}`;
}

export function experimentDocsPath(slug: string): string {
  return `${docsRoute}/experiments/${slug}`;
}

export function estimateReadingMinutes(text: string | undefined, fallback?: number): number {
  if (fallback && fallback > 0) return fallback;
  if (!text) return 5;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 200));
}
