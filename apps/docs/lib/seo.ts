import type { Metadata, Viewport } from "next";
import { getExperimentCount } from "@/lib/catalog.server";
import { siteIcons } from "@/lib/logo";
import { getPageImage, getPageMarkdownUrl, type source } from "@/lib/source";
import {
  appName,
  docsRoute,
  gitConfig,
  githubProfileUrl,
  githubRepoUrl,
  siteDescription,
  siteKeywords,
  siteTitle,
  siteUrl,
  themeColor,
} from "@/lib/shared";

type DocsPage = ReturnType<(typeof source)["getPage"]>;

function absoluteUrl(path: string): string {
  return new URL(path, getMetadataBase()).href;
}

/** Prefer env override; use localhost in dev so new pages' OG URLs resolve locally. */
export function getMetadataBase(): URL {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return new URL(fromEnv);
  if (process.env.NODE_ENV === "development") return new URL("http://localhost:3000");
  return new URL(siteUrl);
}

export const rootViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: themeColor.dark },
  ],
};

export function createRootMetadata(): Metadata {
  const ogImage = "/opengraph-image";
  const experimentCount = getExperimentCount();
  const title = siteTitle(experimentCount);
  const description = siteDescription(experimentCount);

  return {
    metadataBase: getMetadataBase(),
    title: {
      default: title,
      template: `%s | ${appName}`,
    },
    description,
    keywords: siteKeywords,
    authors: [{ name: gitConfig.user, url: githubProfileUrl }],
    creator: gitConfig.user,
    publisher: appName,
    applicationName: appName,
    category: "technology",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: siteUrl,
      types: {
        "text/markdown": `${siteUrl}/llms-full.txt`,
      },
    },
    openGraph: {
      title,
      description,
      siteName: appName,
      type: "website",
      locale: "en_US",
      url: siteUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    icons: {
      icon: [
        { url: siteIcons.faviconIco, sizes: "16x16 32x32 48x48" },
        { url: siteIcons.favicon192, sizes: "192x192", type: "image/png" },
        { url: siteIcons.favicon256, sizes: "256x256", type: "image/png" },
        { url: siteIcons.favicon128, sizes: "128x128", type: "image/png" },
        { url: siteIcons.favicon64, sizes: "64x64", type: "image/png" },
        { url: siteIcons.favicon48, sizes: "48x48", type: "image/png" },
        { url: siteIcons.favicon32, sizes: "32x32", type: "image/png" },
        { url: siteIcons.favicon16, sizes: "16x16", type: "image/png" },
      ],
      shortcut: siteIcons.favicon32,
      apple: [{ url: siteIcons.appleTouch, sizes: "180x180", type: "image/png" }],
    },
  };
}

export function createDocsPageMetadata(page: NonNullable<DocsPage>): Metadata {
  const canonical = absoluteUrl(page.url);
  const image = getPageImage(page).url;
  const pageTags = page.data.tags ?? [];
  const pageBindings = page.data.bindings ?? [];
  const keywords = Array.from(
    new Set([
      ...siteKeywords,
      page.data.title,
      ...pageTags,
      ...pageBindings,
      "Cloudflare Workers experiment",
      "deployable reference",
    ]),
  );

  return {
    title: page.data.title,
    description: page.data.description,
    keywords,
    alternates: {
      canonical,
      types: {
        "text/markdown": absoluteUrl(getPageMarkdownUrl(page).url),
      },
    },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: canonical,
      type: "article",
      siteName: appName,
      locale: "en_US",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: page.data.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.data.title,
      description: page.data.description,
      images: [image],
    },
  };
}

export function createWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: appName,
    description: siteDescription(getExperimentCount()),
    url: siteUrl,
    inLanguage: "en-US",
    publisher: {
      "@type": "Organization",
      name: appName,
      url: siteUrl,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/api/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function createDocsPageJsonLd(page: NonNullable<DocsPage>) {
  const url = absoluteUrl(page.url);
  const keywords = [...(page.data.tags ?? []), ...(page.data.bindings ?? [])];

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.data.title,
    description: page.data.description,
    keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
    url,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: appName,
      url: siteUrl,
    },
    author: {
      "@type": "Organization",
      name: gitConfig.user,
      url: githubProfileUrl,
    },
    publisher: {
      "@type": "Organization",
      name: appName,
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    isBasedOn: {
      "@type": "SoftwareSourceCode",
      codeRepository: githubRepoUrl,
      programmingLanguage: "TypeScript",
    },
  };
}

export function createDocsBreadcrumbJsonLd(page: NonNullable<DocsPage>) {
  const crumbs = [
    { name: appName, url: siteUrl },
    { name: "Docs", url: absoluteUrl(docsRoute) },
  ];
  if (page.slugs.length > 0) crumbs.push({ name: page.data.title, url: absoluteUrl(page.url) });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}
