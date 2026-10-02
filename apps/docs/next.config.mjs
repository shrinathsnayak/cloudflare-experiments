import path from "node:path";
import { fileURLToPath } from "node:url";
import { createMDX } from "fumadocs-mdx/next";
import { DOCS_CACHE_CONTROL, SECURITY_HEADERS } from "./lib/security-headers.mjs";

const withMDX = createMDX();
const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** Legacy doc URLs (pre-homepage) redirect into /docs. */
const legacyDocRedirects = [
  "quickstart",
  "philosophy",
  "self-hosted",
  "changelog",
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
    optimizePackageImports: ["lucide-react"],
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
  async headers() {
    return [
      {
        source: "/docs/:path*",
        headers: [...SECURITY_HEADERS, { key: "Cache-Control", value: DOCS_CACHE_CONTROL }],
      },
      {
        source: "/api/:path*",
        headers: [...SECURITY_HEADERS],
      },
      {
        source: "/:path*",
        headers: [...SECURITY_HEADERS],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/introduction", destination: "/docs", permanent: true },
      ...legacyDocRedirects,
      { source: "/experiments/:path*", destination: "/docs/experiments/:path*", permanent: true },
      { source: "/reference/:path*", destination: "/docs/reference/:path*", permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/docs/:slug*.md",
        destination: "/llms.mdx/:slug*/content.md",
      },
    ];
  },
};

export default withMDX(config);
