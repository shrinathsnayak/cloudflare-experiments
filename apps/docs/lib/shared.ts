export const appName = "Cloudflare Experiments";
export const heroTitle = "Build at the edge. For real.";

/** Pass the derived count from `getExperimentCount()` so copy never drifts from the repo. */
export function heroDescription(experimentCount: number): string {
  return `${experimentCount} deployable Cloudflare Workers - real tools with tests, API docs, and a one-click Deploy button. Not Hello World demos.`;
}

export function siteTitle(experimentCount: number): string {
  return `${experimentCount} Cloudflare Workers Experiments - Deployable Reference Implementations`;
}

export function siteDescription(experimentCount: number): string {
  return `${experimentCount} open-source Cloudflare Workers you can deploy in one click - pasteable reference implementations for Workers AI (including Clef decision models / Jev-compatible APIs), MCP, RAG, D1, R2, Durable Objects, Browser Rendering, and edge APIs. Built for developers and AI agents.`;
}

export const themeColor = { light: "#ffffff", dark: "#0a0a0a" } as const;
export const siteKeywords = [
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
  "MCP server",
  "decision model",
  "Jev alternative",
  "Clef Workers AI",
  "llms.txt",
  "serverless",
  "developer tools",
  "edge platform",
  "reference implementation",
  "AI agents",
];
export const siteUrl = "https://cloudflare-experiments.com";
export const docsRoute = "/docs";
export const homeRoute = "/";
export const docsImageRoute = "/og";
export const docsContentRoute = "/llms.mdx";

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
  text: "This site is not affiliated with or endorsed by Cloudflare, Inc. It simply showcases experiments built using Cloudflare services.",
};
