import type { Metadata } from "next";
import { StaticPageShell } from "@/components/static-page-shell";
import { appName, brandProductName, siteUrl } from "@/lib/shared";

export const metadata: Metadata = {
  title: `Privacy · ${brandProductName}`,
  description: `Privacy practices for ${appName} (${siteUrl}) - what we collect, what we do not, and how agents may use public docs.`,
};

export default function PrivacyPage() {
  return (
    <StaticPageShell
      title={`Privacy Policy · ${brandProductName}`}
      description={`${appName} is a documentation and open-source catalog site. This page explains what limited data we process.`}
    >
      <p>
        Last updated: October 5, 2026. This policy applies to {siteUrl} and the public APIs hosted
        on the same domain (search, MCP, health, OpenAPI, and discovery files). It does not cover
        Cloudflare Inc. products or third-party Deploy destinations you open from Deploy buttons.
      </p>
      <h2>What we collect</h2>
      <p>
        The site is primarily static documentation. Edge request logs may include standard HTTP
        metadata (IP address, User-Agent, path, status, timing) as processed by Cloudflare Workers
        and CDN infrastructure. Optional first-party analytics (Traks) may record anonymized or
        pseudonymous page views when enabled in production; it does not sell personal data. API rate
        limiting stores short-lived counters keyed by client IP for abuse prevention.
      </p>
      <h2>What we do not collect</h2>
      <p>
        We do not require accounts, passwords, or payment information on this site. We do not
        intentionally collect government IDs, precise geolocation beyond what Cloudflare edge
        routing implies, or contents of private messages except when you email us. Search queries
        sent to <code>/api/search</code> are processed to return docs hits and may appear in
        operational logs.
      </p>
      <h2>AI crawlers and llms.txt</h2>
      <p>
        Public docs are intentionally readable by AI agents. Our robots.txt Content-Signal prefers{" "}
        <code>search=yes</code> and <code>ai-input=yes</code> while discouraging training use (
        <code>ai-train=no</code>). Agents should follow those signals and the guidance in{" "}
        <code>/llms.txt</code>.
      </p>
      <h2>Contact</h2>
      <p>
        Privacy questions: email{" "}
        <a href="mailto:contact@cloudflare-experiments.com">contact@cloudflare-experiments.com</a> or
        open a GitHub issue. We will update this page when practices change materially.
      </p>
    </StaticPageShell>
  );
}
