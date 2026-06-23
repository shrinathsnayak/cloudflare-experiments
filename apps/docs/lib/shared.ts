export const appName = "Cloudflare Experiments";
export const heroTitle = "Build at the edge. For real.";
export const heroDescription =
  "60+ deployable experiments across the Cloudflare platform - not Hello World demos.";
export const appDescription =
  "Documentation and deployable Cloudflare Workers experiments - edge computing tools using Workers AI, Browser Rendering, R2, D1, and more.";
export const siteKeywords = [
  "Cloudflare Workers",
  "edge computing",
  "Cloudflare experiments",
  "Workers AI",
  "Browser Rendering",
  "Cloudflare R2",
  "Cloudflare D1",
  "serverless",
  "developer tools",
  "edge platform",
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

export const portfolioUrl = "https://snayak.dev";

export const siteBanner = {
  text: "This site is not affiliated with or endorsed by Cloudflare, Inc. It simply showcases experiments built using Cloudflare services.",
};
