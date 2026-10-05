export const appName = "Cloudflare Experiments";
/** Public brand name used in titles, trust pages, and JSON-LD. */
export const brandProductName = "Cloudflare Experiments";
export const heroTitle = "Build at the edge. For real.";

/** One-line scope used in agent surfaces and trust pages. */
export const productScopeBlurb =
  "An open catalog of deployable reference implementations across most Cloudflare products - Workers AI, Durable Objects, D1, R2, KV, Queues, Workflows, Browser Rendering, Vectorize, Hyperdrive, Access, Email, Turnstile, Stream, and more. Experiments typically ship as Workers that wire those products together; this is not a Workers-only catalog.";

/** Pass the derived count from `getExperimentCount()` so copy never drifts from the repo. */
export function heroDescription(experimentCount: number): string {
  return `${experimentCount} deployable reference implementations across Cloudflare products - real tools with tests, API docs, and a one-click Deploy button. Not Hello World demos.`;
}

export function siteTitle(experimentCount: number): string {
  return `${experimentCount} Cloudflare Experiments - Deployable Product Reference Implementations`;
}

export function siteDescription(experimentCount: number): string {
  return `${experimentCount} open-source Cloudflare product experiments you can deploy in one click - pasteable reference implementations for Workers AI (including Clef decision models / Jev-compatible APIs), MCP, RAG, D1, R2, Durable Objects, Browser Rendering, Queues, Access, Email, Turnstile, Stream, and other Cloudflare platform services. Built for developers and AI agents.`;
}

export const themeColor = { light: "#ffffff", dark: "#0a0a0a" } as const;
export const siteKeywords = [
  "Cloudflare products",
  "Cloudflare platform",
  "Cloudflare Workers",
  "edge computing",
  "Cloudflare experiments",
  "Workers AI",
  "Browser Rendering",
  "Cloudflare R2",
  "Cloudflare D1",
  "Durable Objects",
  "Vectorize",
  "AI Gateway",
  "Cloudflare Queues",
  "Cloudflare Access",
  "Cloudflare Email",
  "Turnstile",
  "Cloudflare Stream",
  "MCP server",
  "decision model",
  "Jev alternative",
  "Clef Workers AI",
  "llms.txt",
  "OpenAPI",
  "serverless",
  "developer tools",
  "edge platform",
  "reference implementation",
  "AI agents",
];
export const siteUrl = "https://cloudflare-experiments.com";
export const docsRoute = "/docs";
export const homeRoute = "/";
export const aboutRoute = "/about";
export const contactRoute = "/contact";
export const privacyRoute = "/privacy";
export const developersRoute = "/developers";
export const blogsRoute = "/blogs";
export const docsImageRoute = "/og";
export const docsContentRoute = "/llms.mdx";

/** Static marketing / trust pages that must not be treated as Markdown 404s. */
export const trustPagePaths = [
  aboutRoute,
  contactRoute,
  privacyRoute,
  developersRoute,
  blogsRoute,
] as const;

/** True for exact trust pages or any path under `/blogs` (index + posts). */
export function isTrustOrBlogPath(pathname: string): boolean {
  if ((trustPagePaths as readonly string[]).includes(pathname)) return true;
  return pathname === blogsRoute || pathname.startsWith(`${blogsRoute}/`);
}

/** Public contact channels (no private email inbox required). */
export const contactChannels = {
  githubIssues: "https://github.com/shrinathsnayak/cloudflare-experiments/issues/new",
  githubDiscussions: "https://github.com/shrinathsnayak/cloudflare-experiments/discussions",
  githubProfile: "https://github.com/shrinathsnayak",
  portfolio: "https://snayak.dev",
  x: "https://x.com/shrinathsnayak",
  linkedin: "https://www.linkedin.com/in/shrinathsnayak/",
} as const;

export const gitConfig = {
  user: "shrinathsnayak",
  repo: "cloudflare-experiments",
  branch: "main",
};

export const githubProfileUrl = `https://github.com/${gitConfig.user}`;
export const githubRepoUrl = `${githubProfileUrl}/${gitConfig.repo}`;
export const githubCloneUrl = `${githubRepoUrl}.git`;

export function githubDocsBlobUrl(pagePath: string): string {
  return `${githubRepoUrl}/blob/${gitConfig.branch}/apps/docs/content/docs/${pagePath}`;
}

export function experimentDeployUrl(slug: string): string {
  return `https://deploy.workers.cloudflare.com/?url=${githubRepoUrl}/tree/${gitConfig.branch}/apps/experiments/${slug}`;
}

export function experimentSourceUrl(slug: string): string {
  return `${githubRepoUrl}/tree/${gitConfig.branch}/apps/experiments/${slug}`;
}

/** Docs index section that lists every experiment by category. */
export const experimentsIndexRoute = `${docsRoute}#experiment-categories`;

export const portfolioUrl = "https://snayak.dev";

export function getBuyMeACoffeeUrl(): string | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL?.trim();
  return fromEnv || undefined;
}

export const siteBanner = {
  text: "This site is not affiliated with or endorsed by Cloudflare, Inc. It showcases deployable experiments across most Cloudflare products.",
};
