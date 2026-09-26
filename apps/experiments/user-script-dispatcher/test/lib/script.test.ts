import { describe, it, expect } from "vitest";
import {
  parseScriptRecord,
  serializeScript,
  validateName,
  validateResponse,
} from "../../src/lib/script";

describe("validateName", () => {
  it("accepts valid names", () => {
    expect(validateName("tenant-1")).toBe("tenant-1");
  });

  it("rejects empty or invalid", () => {
    expect(validateName("")).toBeNull();
    expect(validateName("bad name")).toBeNull();
    expect(validateName(undefined)).toBeNull();
  });
});

describe("validateResponse", () => {
  it("accepts plain objects", () => {
    expect(validateResponse({ ok: true })).toEqual({ ok: true });
  });

  it("rejects arrays and non-objects", () => {
    expect(validateResponse([])).toBeNull();
    expect(validateResponse("x")).toBeNull();
  });
});

describe("serializeScript / parseScriptRecord", () => {
  it("round-trips a script", () => {
    const raw = serializeScript("demo", { hello: "world" });
    expect(raw).toBeTruthy();
    const parsed = parseScriptRecord(raw!);
    expect(parsed?.name).toBe("demo");
    expect(parsed?.response).toEqual({ hello: "world" });
  });
});
