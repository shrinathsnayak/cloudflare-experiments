import { describe, expect, it } from "vitest";
import { agentWhenToUseSection } from "../lib/agent-guidance";
import { getSearchOpenApi, getSiteOpenApi } from "../lib/api-catalog";
import { jsonApiError, jsonApiNotFound, jsonMethodNotAllowed } from "../lib/api-error";
import { buildNotFoundMarkdown } from "../lib/not-found-markdown";
import { brandProductName, productScopeBlurb, siteDescription, siteTitle } from "../lib/shared";
import { buildOrganizationJsonLd } from "../lib/organization";

describe("agent-friendly 404 markdown", () => {
  it("includes recovery links and enough explanation", () => {
    const body = buildNotFoundMarkdown("/__ora-404-probe");
    expect(body.length).toBeGreaterThan(20);
    expect(body).toContain("llms.txt");
    expect(body).toContain("sitemap.xml");
    expect(body).toContain("/docs");
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
