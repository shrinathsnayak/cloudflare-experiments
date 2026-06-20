import { describe, it, expect } from "vitest";
import { headersToRecord, shouldRetryWithGet, validateUrl } from "../../src/lib/url";

describe("validateUrl", () => {
  it("returns normalized https URL", () => {
    expect(validateUrl("https://example.com")).toBe("https://example.com/");
  });
});

describe("shouldRetryWithGet", () => {
  it("retries on 405 and 501", () => {
    expect(shouldRetryWithGet(405)).toBe(true);
    expect(shouldRetryWithGet(501)).toBe(true);
    expect(shouldRetryWithGet(200)).toBe(false);
  });
});

describe("headersToRecord", () => {
  it("converts Headers to a plain object", () => {
    const headers = new Headers({ "content-type": "text/plain", "x-test": "1" });
    expect(headersToRecord(headers)).toEqual({
      "content-type": "text/plain",
      "x-test": "1",
    });
  });
});
