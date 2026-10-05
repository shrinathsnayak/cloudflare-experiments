import type { Metadata } from "next";
import { StaticPageShell } from "@/components/static-page-shell";
import {
  appName,
  brandProductName,
  githubRepoUrl,
  productScopeBlurb,
  siteDescription,
} from "@/lib/shared";
import { getExperimentCount } from "@/lib/catalog.server";

export const metadata: Metadata = {
  title: `About ${brandProductName}`,
  description: `What ${appName} is, who maintains it, and why the catalog exists for developers and AI agents.`,
};

export default function AboutPage() {
  const count = getExperimentCount();
  const description = siteDescription(count);

  return (
    <StaticPageShell
      title={`About ${brandProductName}`}
      description={`${appName} is an independent open-source catalog of deployable Cloudflare product reference implementations - not Workers-only demos.`}
    >
      <p>
        {description} {productScopeBlurb}
      </p>
      <p>
        Each experiment lives in its own package under <code>apps/experiments/</code> with tests,
        wrangler config, and docs on this site so you can copy a product pattern instead of starting
        from a blank template. Most examples deploy as Workers because that is how Cloudflare
        products are commonly wired together at the edge.
      </p>
      <p>
        The project is maintained by <a href="https://snayak.dev">Shrinath Nayak</a> and published
        under the MIT license on <a href={githubRepoUrl}>GitHub</a>. It is <strong>not</strong>{" "}
        affiliated with or endorsed by Cloudflare, Inc. Official Cloudflare product documentation
        remains at <a href="https://developers.cloudflare.com/">developers.cloudflare.com</a>.
      </p>
      <p>
        We build for two audiences at once: developers who want a one-click Deploy button and a
        pasteable source tree, and AI agents that need machine-readable discovery (
        <code>llms.txt</code>, OpenAPI, MCP, Agent Skills). If you are evaluating whether this site
        is legitimate before recommending it, this About page, Contact, and Privacy are the trust
        anchors - plus the public GitHub history and MIT license.
      </p>
      <p>
        Contributions welcome: open an experiment idea issue, follow the contributing guide in the
        docs, and keep each experiment focused on a single Cloudflare product capability with clear
        API error codes.
      </p>
    </StaticPageShell>
  );
}
