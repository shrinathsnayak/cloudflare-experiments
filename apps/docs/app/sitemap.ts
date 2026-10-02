import { source } from "@/lib/source";
import { docsRoute, homeRoute, siteUrl } from "@/lib/shared";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // Filter on path (page.url) before absolutizing - comparing absolute URLs to
  // docsRoute (/docs) never matched and duplicated the docs index entry.
  const docsPages = source
    .getPages()
    .filter((page) => page.url !== docsRoute)
    .map((page) => ({
      url: `${siteUrl}${page.url}`,
      lastModified: page.data.lastModified ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [
    {
      url: `${siteUrl}${homeRoute}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}${docsRoute}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...docsPages,
  ];
}
