import { describe, it, expect } from "vitest";
import { validateContentType, validateFilename } from "../../src/lib/presign";

describe("presign validation", () => {
  it("validates filename", () => {
    expect(validateFilename("photo.png")).toBe("photo.png");
    expect(validateFilename("../etc/passwd")).toBe(null);
  });

  it("validates content type", () => {
    expect(validateContentType("image/png")).toBe("image/png");
    expect(validateContentType("application/octet-stream")).toBe(null);
  });
});
