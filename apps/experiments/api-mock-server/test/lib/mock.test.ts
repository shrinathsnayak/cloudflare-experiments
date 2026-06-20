import { describe, it, expect } from "vitest";
import {
  generateSlug,
  matchesMockRequest,
  validateCreateMockRequest,
  validateMethod,
  validateStatus,
} from "../../src/lib/mock";

describe("validateCreateMockRequest", () => {
  it("accepts a valid mock config", () => {
    const result = validateCreateMockRequest({
      path: "/users/1",
      method: "get",
      status: 200,
      body: { ok: true },
      delayMs: 100,
    });

    expect(result).toEqual({
      path: "/users/1",
      method: "GET",
      status: 200,
      body: { ok: true },
      delayMs: 100,
    });
  });

  it("rejects invalid status codes", () => {
    expect(
      validateCreateMockRequest({
        path: "/users",
        method: "GET",
        status: 99,
        body: {},
      })
    ).toBeNull();
  });

  it("rejects paths without a leading slash", () => {
    expect(
      validateCreateMockRequest({
        path: "users",
        method: "GET",
        status: 200,
        body: {},
      })
    ).toBeNull();
  });
});

describe("validateMethod", () => {
  it("normalizes method names", () => {
    expect(validateMethod("post")).toBe("POST");
  });

  it("rejects unknown methods", () => {
    expect(validateMethod("TRACE")).toBeNull();
  });
});

describe("validateStatus", () => {
  it("accepts valid HTTP status codes", () => {
    expect(validateStatus(404)).toBe(404);
  });

  it("rejects out-of-range status codes", () => {
    expect(validateStatus(600)).toBeNull();
  });
});

describe("generateSlug", () => {
  it("returns an 8-character slug", () => {
    expect(generateSlug()).toHaveLength(8);
  });
});

describe("matchesMockRequest", () => {
  const config = {
    slug: "abc12345",
    path: "/users/1",
    method: "GET" as const,
    status: 200,
    body: { id: 1 },
    createdAt: "2024-01-01T00:00:00.000Z",
  };

  it("matches exact paths and subpaths", () => {
    expect(matchesMockRequest(config, "GET", "/users/1")).toBe(true);
    expect(matchesMockRequest(config, "GET", "/users/1/profile")).toBe(true);
  });

  it("rejects mismatched methods", () => {
    expect(matchesMockRequest(config, "POST", "/users/1")).toBe(false);
  });
});
