import { describe, it, expect } from "vitest";
import { validateUrl } from "../../src/lib/url";
import { validateCorsTestRequest } from "../../src/lib/cors";

describe("validateUrl", () => {
  it("accepts https urls", () => {
    expect(validateUrl("https://api.example.com/resource")).toBe(
      "https://api.example.com/resource"
    );
  });

  it("rejects unsupported schemes", () => {
    expect(validateUrl("ftp://example.com")).toBeNull();
  });
});

describe("validateCorsTestRequest", () => {
  it("normalizes method and headers", () => {
    const request = validateCorsTestRequest({
      url: "https://api.example.com",
      origin: "https://app.example.com",
      method: "post",
      headers: ["Authorization", "authorization", "X-Custom"],
    });

    expect(request).toEqual({
      url: "https://api.example.com",
      origin: "https://app.example.com",
      method: "POST",
      headers: ["authorization", "x-custom"],
    });
  });

  it("rejects invalid methods", () => {
    expect(
      validateCorsTestRequest({
        url: "https://api.example.com",
        origin: "https://app.example.com",
        method: "TRACE",
      })
    ).toBeNull();
  });
});
