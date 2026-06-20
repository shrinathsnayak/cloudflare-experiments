import type { Metadata } from "next";
import { getPageImage, getPageMarkdownUrl, type source } from "@/lib/source";
import { appDescription, appName, gitConfig, siteKeywords, siteUrl } from "@/lib/shared";

type DocsPage = ReturnType<(typeof source)["getPage"]> & {};

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).href;
}

const githubProfileUrl = `https://github.com/${gitConfig.user}`;
const githubRepoUrl = `${githubProfileUrl}/${gitConfig.repo}`;

export function createRootMetadata(): Metadata {
  const ogImage = "/opengraph-image";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: appName,
      template: `%s | ${appName}`,
    },
    description: appDescription,
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
      title: appName,
      description: appDescription,
      siteName: appName,
      type: "website",
      locale: "en_US",
      url: siteUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: appName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: appName,
      description: appDescription,
      images: [ogImage],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
  };
}

export function createDocsPageMetadata(page: NonNullable<DocsPage>): Metadata {
  const canonical = absoluteUrl(page.url);
  const image = getPageImage(page).url;

  return {
    title: page.data.title,
    description: page.data.description,
    keywords: siteKeywords,
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
    description: appDescription,
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

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.data.title,
    description: page.data.description,
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
