import path from "node:path";
import { fileURLToPath } from "node:url";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();
const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** Legacy doc URLs (pre-homepage) redirect into /docs. */
const legacyDocRedirects = [
  "quickstart",
  "philosophy",
  "contributing",
  "adding-experiments",
  "code-standards",
].map((segment) => ({
  source: `/${segment}`,
  destination: `/docs/${segment}`,
  permanent: true,
}));

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  cacheComponents: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "fumadocs-ui"],
  },
  turbopack: {
    root: monorepoRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "deploy.workers.cloudflare.com",
        pathname: "/button",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/introduction", destination: "/docs", permanent: true },
      ...legacyDocRedirects,
      { source: "/experiments/:path*", destination: "/docs/experiments/:path*", permanent: true },
      { source: "/reference/:path*", destination: "/docs/reference/:path*", permanent: true },
    ];
  },
};

export default withMDX(config);
