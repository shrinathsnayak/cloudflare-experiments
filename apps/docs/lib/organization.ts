import { logoPathPublic } from "@/lib/logo";
import {
  appName,
  brandProductName,
  contactChannels,
  githubProfileUrl,
  githubRepoUrl,
  siteUrl,
} from "@/lib/shared";

/** Pure Organization JSON-LD builder (safe to unit-test without MDX source). */
export function buildOrganizationJsonLd(input: { description: string; logoUrl: string }) {
  return {
    "@type": "Organization" as const,
    name: appName,
    alternateName: brandProductName,
    description: input.description,
    url: siteUrl,
    logo: input.logoUrl,
    sameAs: [
      githubRepoUrl,
      githubProfileUrl,
      contactChannels.portfolio,
      contactChannels.x,
      contactChannels.linkedin,
    ],
    contactPoint: [
      {
        "@type": "ContactPoint" as const,
        contactType: "technical support",
        url: contactChannels.githubIssues,
        // Public inbox for agents/humans; forwards via maintainer portfolio domain.
        email: "contact@cloudflare-experiments.com",
        availableLanguage: ["English"],
      },
    ],
    address: {
      "@type": "PostalAddress" as const,
      addressCountry: "IN",
    },
  };
}

export function organizationLogoPath(): string {
  return logoPathPublic;
}
