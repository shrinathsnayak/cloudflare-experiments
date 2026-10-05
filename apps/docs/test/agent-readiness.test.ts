import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { agentWhenToUseSection } from "../lib/agent-guidance";
import { getSearchOpenApi, getSiteOpenApi } from "../lib/api-catalog";
import { jsonApiError, jsonApiNotFound, jsonMethodNotAllowed } from "../lib/api-error";
import { blogCovers, withUnsplashUtm } from "../lib/blog-covers";
import { buildBlogIndexJsonLd, buildBlogPostJsonLd } from "../lib/blog-schema";
import type { BlogPostMeta } from "../lib/blog-meta";
import { buildNotFoundMarkdown } from "../lib/not-found-markdown";
import { blogPageSchema } from "../lib/page-schema";
import {
  blogsRoute,
  brandProductName,
  isTrustOrBlogPath,
  productScopeBlurb,
  siteDescription,
  siteTitle,
} from "../lib/shared";
import { buildOrganizationJsonLd } from "../lib/organization";

describe("agent-friendly 404 markdown", () => {
  it("includes recovery links and enough explanation", () => {
    const body = buildNotFoundMarkdown("/__ora-404-probe");
    expect(body.length).toBeGreaterThan(20);
    expect(body).toContain("llms.txt");
    expect(body).toContain("sitemap.xml");
    expect(body).toContain("/docs");
    expect(body).toContain("/blogs");
    expect(body).toMatch(/^# 404 Not Found/m);
  });
});

describe("JSON API errors", () => {
  it("returns error, code, and hint", async () => {
    const res = jsonApiError("boom", "INTERNAL_ERROR", 500);
    expect(res.status).toBe(500);
    expect(res.headers.get("Content-Type")).toMatch(/application\/json/);
    const body = await res.json();
    expect(body.error).toBe("boom");
    expect(body.code).toBe("INTERNAL_ERROR");
    expect(typeof body.hint).toBe("string");
    expect(body.hint.length).toBeGreaterThan(10);
  });

  it("returns JSON 404 for unknown API paths", async () => {
    const res = jsonApiNotFound("/api/does-not-exist");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.code).toBe("NOT_FOUND");
    expect(body.hint).toMatch(/openapi/i);
  });

  it("returns 405 with Allow header", async () => {
    const res = jsonMethodNotAllowed(["GET"]);
    expect(res.status).toBe(405);
    expect(res.headers.get("Allow")).toBe("GET");
    const body = await res.json();
    expect(body.code).toBe("METHOD_NOT_ALLOWED");
  });
});

describe("agent when-to-use guidance", () => {
  it("names concrete jobs and how to call the site", () => {
    const section = agentWhenToUseSection();
    expect(section).toMatch(/## When to use this/);
    expect(section).toMatch(/Workers AI|Durable Objects|Browser Rendering/);
    expect(section).toMatch(/How agents should call this site/);
    expect(section).toMatch(/api\/search/);
    expect(section).toMatch(/Not a fit/);
  });
});

describe("OpenAPI / function-calling surface", () => {
  it("publishes unique operationIds, descriptions, and typed schemas", () => {
    const spec = getSiteOpenApi(10);
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.paths["/api/search"].get.operationId).toBe("searchDocs");
    expect(spec.paths["/api/search"].get.description.length).toBeGreaterThan(20);
    expect(spec.paths["/api/health"].get.operationId).toBe("getHealth");
    expect(spec.paths["/api/mcp"].post.operationId).toBe("mcpJsonRpc");
    expect(spec.components.schemas.ApiError.required).toEqual(["error", "code", "hint"]);

    const searchOnly = getSearchOpenApi(10);
    const searchParams = searchOnly.paths["/api/search"].get.parameters;
    expect(searchParams.every((p: { description?: string }) => Boolean(p.description))).toBe(true);
  });
});

describe("brand discoverability copy", () => {
  it("uses Cloudflare Experiments as the public brand name", () => {
    expect(brandProductName).toBe("Cloudflare Experiments");
    expect(brandProductName).not.toMatch(/Workers$/);
  });

  it("frames the catalog as Cloudflare products, not Workers-only", () => {
    expect(productScopeBlurb).toMatch(/most Cloudflare products/i);
    expect(productScopeBlurb).toMatch(/not a Workers-only catalog/i);
    expect(siteTitle(42)).toContain("Cloudflare Experiments");
    expect(siteTitle(42)).not.toMatch(/Experiments Workers/);
    expect(siteTitle(42)).toMatch(/Product Reference Implementations/i);
    expect(siteDescription(42)).toMatch(/Cloudflare product experiments/i);
    expect(agentWhenToUseSection()).toMatch(/most Cloudflare products/i);
  });
});

describe("Organization JSON-LD completeness helpers", () => {
  it("includes description, contactPoint, address, and sameAs/logo", () => {
    const org = buildOrganizationJsonLd({
      description: "Cloudflare Experiments catalog for Cloudflare product patterns.",
      logoUrl: "https://cloudflare-experiments.com/logo.png",
    });
    expect(org.description.length).toBeGreaterThan(20);
    expect(org.logo).toContain("logo");
    expect(org.sameAs.length).toBeGreaterThan(0);
    expect(org.contactPoint[0].contactType).toBe("technical support");
    expect(org.contactPoint[0].email).toContain("@");
    expect(org.address["@type"]).toBe("PostalAddress");
    expect(org.address.addressCountry).toBe("IN");
  });
});

function parseBlogFrontmatter(raw: string): Record<string, unknown> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error("missing frontmatter");
  const yaml = match[1];
  const data: Record<string, unknown> = {};
  let currentKey: string | null = null;
  let currentList: string[] | null = null;

  for (const line of yaml.split(/\r?\n/)) {
    if (/^\s+-\s+/.test(line) && currentKey && currentList) {
      currentList.push(line.replace(/^\s+-\s+/, "").replace(/^["']|["']$/g, ""));
      continue;
    }
    if (currentKey && currentList) {
      data[currentKey] = currentList;
      currentKey = null;
      currentList = null;
    }
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, value] = kv;
    if (value === "" || value === "|" || value === ">") {
      currentKey = key;
      currentList = [];
      continue;
    }
    if (value === "true" || value === "false") {
      data[key] = value === "true";
    } else if (/^\d+$/.test(value)) {
      data[key] = Number(value);
    } else {
      data[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  if (currentKey && currentList) data[currentKey] = currentList;
  return data;
}

describe("blog MDX content", () => {
  const blogDir = join(process.cwd(), "content", "blog");
  const files = readdirSync(blogDir).filter((name) => name.endsWith(".mdx"));

  it("has detailed posts that each link experiments and Cloudflare product docs", () => {
    expect(files.length).toBeGreaterThanOrEqual(8);
    for (const file of files) {
      const raw = readFileSync(join(blogDir, file), "utf8");
      const parsed = blogPageSchema.safeParse(parseBlogFrontmatter(raw));
      expect(parsed.success, `${file}: ${JSON.stringify(parsed.error?.issues ?? [])}`).toBe(true);
      if (!parsed.success) continue;
      expect(parsed.data.experiments.length).toBeGreaterThan(0);
      expect(raw.length).toBeGreaterThan(4000);
      expect(raw).toContain("developers.cloudflare.com");
      expect(raw).toMatch(/## Cloudflare products/i);
    }
  });

  it("registers an Unsplash cover with photographer backlinks for every post", () => {
    expect(Object.keys(blogCovers).length).toBe(files.length);
    for (const file of files) {
      const slug = file.replace(/\.mdx$/, "");
      const cover = blogCovers[slug];
      expect(cover, slug).toBeDefined();
      expect(cover.src).toMatch(/^https:\/\/images\.unsplash\.com\//);
      expect(cover.photographer.length).toBeGreaterThan(2);
      expect(cover.photographerUrl).toMatch(/^https:\/\/unsplash\.com\/@/);
      expect(cover.unsplashUrl).toMatch(/^https:\/\/unsplash\.com\/photos\//);
      expect(withUnsplashUtm(cover.photographerUrl)).toContain("utm_source=cloudflare_experiments");
    }
  });

  it("builds Blog + ItemList JSON-LD for the index", () => {
    const posts: BlogPostMeta[] = [
      {
        slug: "demo",
        title: "Demo post",
        description: "A demo description for schema tests.",
        datePublished: "2026-10-05",
        dateModified: "2026-10-05",
        keywords: ["Cloudflare"],
        readingMinutes: 5,
        featured: true,
        relatedExperiments: [
          { slug: "whereami", title: "Where Am I", blurb: "request.cf demo" },
        ],
        url: `${blogsRoute}/demo`,
      },
    ];
    const graph = buildBlogIndexJsonLd({
      description: "Cloudflare Experiments catalog.",
      logoUrl: "https://cloudflare-experiments.com/logo.png",
      posts,
    })["@graph"] as Array<Record<string, unknown>>;
    const types = graph.map((node) => node["@type"]);
    expect(types).toContain("Blog");
    expect(types).toContain("ItemList");
    expect(types).toContain("BreadcrumbList");
  });

  it("builds BlogPosting JSON-LD that abouts related experiments", () => {
    const post: BlogPostMeta = {
      slug: "screenshot-any-url-at-the-edge",
      title: "How to take a screenshot of any URL at the edge",
      description: "Capture PNG screenshots with Browser Rendering.",
      datePublished: "2026-09-15",
      dateModified: "2026-10-05",
      keywords: ["Browser Rendering"],
      readingMinutes: 9,
      featured: true,
      relatedExperiments: [
        { slug: "screenshot-api", title: "Screenshot API", blurb: "PNG captures" },
        { slug: "browser-links", title: "Browser Links", blurb: "Extract links" },
      ],
      url: `${blogsRoute}/screenshot-any-url-at-the-edge`,
    };
    const graph = buildBlogPostJsonLd(post, {
      description: "Cloudflare Experiments catalog.",
      logoUrl: "https://cloudflare-experiments.com/logo.png",
    })["@graph"] as Array<Record<string, unknown>>;
    const article = graph.find((node) => node["@type"] === "BlogPosting");
    expect(article?.headline).toBe(post.title);
    expect(Array.isArray(article?.about)).toBe(true);
    expect((article?.about as unknown[]).length).toBe(2);
  });

  it("treats /blogs and post slugs as trust/blog HTML paths", () => {
    expect(isTrustOrBlogPath(blogsRoute)).toBe(true);
    expect(isTrustOrBlogPath(`${blogsRoute}/screenshot-any-url-at-the-edge`)).toBe(true);
    expect(isTrustOrBlogPath("/docs")).toBe(false);
  });
});
