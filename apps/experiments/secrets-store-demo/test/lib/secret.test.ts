import { describe, it, expect } from "vitest";
import { previewSecret, readSecretStatus, verifySecret } from "../../src/lib/secret";

describe("previewSecret", () => {
  it("shows first two characters", () => {
    expect(previewSecret("abcdef")).toBe("ab***");
  });
});

describe("readSecretStatus", () => {
  it("returns configured when get succeeds", async () => {
    const status = await readSecretStatus({
      get: async () => "secret-value",
    });
    expect(status).toEqual({
      configured: true,
      length: 12,
      preview: "se***",
    });
  });

  it("returns configured false when get throws", async () => {
    const status = await readSecretStatus({
      get: async () => {
        throw new Error("not found");
      },
    });
    expect(status).toEqual({ configured: false });
  });
});

describe("verifySecret", () => {
  it("compares without exposing the secret", async () => {
    const binding = { get: async () => "expected-key" };
    expect(await verifySecret(binding, "expected-key")).toBe(true);
    expect(await verifySecret(binding, "wrong")).toBe(false);
  });
});
