import { siteUrl } from "@/lib/shared";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    // Absolute HTTPS URL only — Google ignores Host; do not emit Host with a scheme.
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
