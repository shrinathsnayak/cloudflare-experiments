import type { BlogPostMeta } from "@/lib/blog-meta";
import { blogPostPath } from "@/lib/blog-meta";
import { buildOrganizationJsonLd } from "@/lib/organization";
import {
  appName,
  blogsRoute,
  docsRoute,
  gitConfig,
  githubProfileUrl,
  githubRepoUrl,
  siteUrl,
} from "@/lib/shared";

function absoluteBlogUrl(path: string, siteBase = siteUrl): string {
  return new URL(path, siteBase).href;
}

function blogIndexDescription(): string {
  return `Guides and SEO-friendly articles that introduce Cloudflare product patterns and link to deployable ${appName} experiments.`;
}

/** Pure Blog index JSON-LD (safe to unit-test without MDX source). */
export function buildBlogIndexJsonLd(input: {
  description: string;
  logoUrl: string;
  posts: BlogPostMeta[];
  siteBase?: string;
}) {
  const siteBase = input.siteBase ?? siteUrl;
  const organization = buildOrganizationJsonLd({
    description: input.description,
    logoUrl: input.logoUrl,
  });
  const posts = input.posts;
  const blogUrl = absoluteBlogUrl(blogsRoute, siteBase);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog" as const,
        "@id": `${blogUrl}#blog`,
        name: `${appName} Blog`,
        description: blogIndexDescription(),
        url: blogUrl,
        inLanguage: "en-US",
        publisher: { "@id": `${siteBase}/#organization` },
        blogPost: posts.map((post) => ({
          "@type": "BlogPosting" as const,
          "@id": `${absoluteBlogUrl(blogPostPath(post.slug), siteBase)}#article`,
          headline: post.title,
          description: post.description,
          url: absoluteBlogUrl(blogPostPath(post.slug), siteBase),
          datePublished: post.datePublished,
          dateModified: post.dateModified,
          image: post.cover?.src,
        })),
      },
      {
        "@type": "ItemList" as const,
        "@id": `${blogUrl}#itemlist`,
        name: `${appName} blog posts`,
        numberOfItems: posts.length,
        itemListElement: posts.map((post, index) => ({
          "@type": "ListItem" as const,
          position: index + 1,
          url: absoluteBlogUrl(blogPostPath(post.slug), siteBase),
          name: post.title,
        })),
      },
      {
        "@type": "BreadcrumbList" as const,
        itemListElement: [
          { "@type": "ListItem" as const, position: 1, name: appName, item: siteBase },
          { "@type": "ListItem" as const, position: 2, name: "Blog", item: blogUrl },
        ],
      },
      {
        "@id": `${siteBase}/#organization`,
        ...organization,
      },
    ],
  };
}

/** Pure BlogPosting JSON-LD (safe to unit-test without MDX source). */
export function buildBlogPostJsonLd(
  post: BlogPostMeta,
  input: { description: string; logoUrl: string; siteBase?: string }
) {
  const siteBase = input.siteBase ?? siteUrl;
  const organization = buildOrganizationJsonLd({
    description: input.description,
    logoUrl: input.logoUrl,
  });
  const url = absoluteBlogUrl(blogPostPath(post.slug), siteBase);
  const blogUrl = absoluteBlogUrl(blogsRoute, siteBase);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting" as const,
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        keywords: post.keywords.join(", "),
        url,
        inLanguage: "en-US",
        datePublished: post.datePublished,
        dateModified: post.dateModified,
        image: post.cover
          ? {
              "@type": "ImageObject" as const,
              url: post.cover.src,
              caption: `Photo by ${post.cover.photographer} on Unsplash`,
              creditText: post.cover.photographer,
              acquireLicensePage: post.cover.unsplashUrl,
            }
          : undefined,
        isPartOf: {
          "@type": "Blog" as const,
          "@id": `${blogUrl}#blog`,
          name: `${appName} Blog`,
          url: blogUrl,
        },
        author: {
          "@type": "Person" as const,
          name: gitConfig.user,
          url: githubProfileUrl,
        },
        publisher: { "@id": `${siteBase}/#organization` },
        mainEntityOfPage: {
          "@type": "WebPage" as const,
          "@id": url,
        },
        about: post.relatedExperiments.map((experiment) => ({
          "@type": "SoftwareSourceCode" as const,
          name: experiment.title,
          url: absoluteBlogUrl(`${docsRoute}/experiments/${experiment.slug}`, siteBase),
          codeRepository: githubRepoUrl,
          programmingLanguage: "TypeScript",
        })),
      },
      {
        "@type": "BreadcrumbList" as const,
        itemListElement: [
          { "@type": "ListItem" as const, position: 1, name: appName, item: siteBase },
          { "@type": "ListItem" as const, position: 2, name: "Blog", item: blogUrl },
          { "@type": "ListItem" as const, position: 3, name: post.title, item: url },
        ],
      },
      {
        "@id": `${siteBase}/#organization`,
        ...organization,
      },
    ],
  };
}

export { blogIndexDescription };
