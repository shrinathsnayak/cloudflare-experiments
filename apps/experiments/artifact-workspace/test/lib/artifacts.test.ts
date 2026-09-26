import { describe, it, expect } from "vitest";
import { validatePath } from "../../src/lib/artifacts";

describe("validatePath", () => {
  it("accepts nested safe paths", () => {
    expect(validatePath("docs/readme.md")).toBe("docs/readme.md");
    expect(validatePath("a_b-c.1")).toBe("a_b-c.1");
  });

  it("rejects path traversal", () => {
    expect(validatePath("../secret")).toBeNull();
    expect(validatePath("foo/../bar")).toBeNull();
  });

  it("rejects invalid characters", () => {
    expect(validatePath("foo bar")).toBeNull();
    expect(validatePath("foo@bar")).toBeNull();
  });

  it("rejects overly long paths", () => {
    expect(validatePath("a".repeat(257))).toBeNull();
  });

  it("rejects empty", () => {
    expect(validatePath("")).toBeNull();
    expect(validatePath(undefined)).toBeNull();
  });
});
