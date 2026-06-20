import path from "node:path";
import { fileURLToPath } from "node:url";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();
const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
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
      { source: "/quickstart", destination: "/docs/quickstart", permanent: true },
      { source: "/philosophy", destination: "/docs/philosophy", permanent: true },
      { source: "/contributing", destination: "/docs/contributing", permanent: true },
      { source: "/code-standards", destination: "/docs/code-standards", permanent: true },
      { source: "/adding-experiments", destination: "/docs/adding-experiments", permanent: true },
      { source: "/experiments/:path*", destination: "/docs/experiments/:path*", permanent: true },
      { source: "/reference/:path*", destination: "/docs/reference/:path*", permanent: true },
    ];
  },
};

export default withMDX(config);
