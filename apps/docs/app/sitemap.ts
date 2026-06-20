import { source } from "@/lib/source";
import { docsRoute, homeRoute, siteUrl } from "@/lib/shared";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const docsPages = source.getPages().map((page) => ({
    url: `${siteUrl}${page.url}`,
    lastModified: page.data.lastModified ?? new Date(),
    changeFrequency: "weekly" as const,
    priority: page.url === docsRoute ? 1 : 0.8,
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
    ...docsPages.filter((page) => page.url !== docsRoute),
  ];
}
