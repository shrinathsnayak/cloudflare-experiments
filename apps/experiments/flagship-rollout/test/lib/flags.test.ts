import { describe, it, expect } from "vitest";
import { buildContext, parseDefaultBoolean, validateFlagKey } from "../../src/lib/flags";

describe("flags lib", () => {
  it("validates flag keys", () => {
    expect(validateFlagKey("new-checkout")).toBe("new-checkout");
    expect(validateFlagKey("feature.v2")).toBe("feature.v2");
    expect(validateFlagKey("bad key")).toBeNull();
    expect(validateFlagKey("")).toBeNull();
  });

  it("parses default boolean query values", () => {
    expect(parseDefaultBoolean("true")).toBe(true);
    expect(parseDefaultBoolean("false")).toBe(false);
    expect(parseDefaultBoolean(undefined)).toBe(false);
    expect(parseDefaultBoolean("1")).toBe(true);
  });

  it("builds evaluation context from userId", () => {
    expect(buildContext("user-42")).toEqual({ userId: "user-42" });
    expect(buildContext(undefined)).toEqual({});
  });
});
