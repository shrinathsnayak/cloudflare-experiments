import { getBlogCover } from "@/lib/blog-covers";
import { blogSource, type BlogPage } from "@/lib/blog-source";
import {
  estimateReadingMinutes,
  type BlogPostMeta,
  type BlogRelatedExperiment,
} from "@/lib/blog-meta";
import { blogsRoute } from "@/lib/shared";
import { source } from "@/lib/source";

export {
  blogPostPath,
  experimentDocsPath,
  type BlogPostMeta,
  type BlogRelatedExperiment,
} from "@/lib/blog-meta";
export { blogsRoute };

function resolveExperiment(slug: string): BlogRelatedExperiment {
  const page = source.getPage(["experiments", slug]);
  return {
    slug,
    title: page?.data.title ?? slug,
    blurb: page?.data.description ?? `Deployable ${slug} experiment.`,
  };
}

export function toBlogPostMeta(page: BlogPage): BlogPostMeta {
  const slug = page.slugs[0] ?? page.url.replace(`${blogsRoute}/`, "");
  const datePublished = page.data.date;
  const dateModified = page.data.updated ?? datePublished;
  const keywords = page.data.keywords ?? [];
  const experimentSlugs = page.data.experiments ?? [];

  return {
    slug,
    title: page.data.title,
    description: page.data.description ?? "",
    datePublished,
    dateModified,
    keywords,
    readingMinutes: estimateReadingMinutes(undefined, page.data.readingMinutes),
    featured: page.data.featured === true,
    relatedExperiments: experimentSlugs.map(resolveExperiment),
    url: page.url,
    cover: getBlogCover(slug),
  };
}

/** Async meta with reading time from processed markdown when available. */
export async function toBlogPostMetaAsync(page: BlogPage): Promise<BlogPostMeta> {
  const base = toBlogPostMeta(page);
  if (page.data.readingMinutes) return base;
  try {
    const text = await page.data.getText("processed");
    return { ...base, readingMinutes: estimateReadingMinutes(text) };
  } catch {
    return base;
  }
}

export function getAllBlogPages(): BlogPage[] {
  return blogSource.getPages().filter((page) => page.slugs.length === 1);
}

export function getAllBlogPosts(): BlogPostMeta[] {
  return getAllBlogPages()
    .map(toBlogPostMeta)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.datePublished.localeCompare(a.datePublished);
    });
}

export function getBlogPage(slug: string): BlogPage | undefined {
  return blogSource.getPage([slug]);
}

export function getBlogPost(slug: string): BlogPostMeta | undefined {
  const page = getBlogPage(slug);
  return page ? toBlogPostMeta(page) : undefined;
}

export function getBlogSlugs(): string[] {
  return getAllBlogPages().map((page) => page.slugs[0]!);
}
