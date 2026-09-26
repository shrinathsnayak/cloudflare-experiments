import { describe, it, expect } from "vitest";
import { buildWorkerCode, validateCode } from "../../src/lib/runner";

describe("runner lib", () => {
  it("validates code length", () => {
    expect(validateCode("export default { fetch() {} }")).toBeTruthy();
    expect(validateCode("")).toBeNull();
    expect(validateCode("x".repeat(10_001))).toBeNull();
  });

  it("builds modules with globalOutbound null", () => {
    const code = "export default { async fetch() { return Response.json({ ok: true }); } }";
    const workerCode = buildWorkerCode(code);
    expect(workerCode.mainModule).toBe("index.js");
    expect(workerCode.modules["index.js"]).toBe(code);
    expect(workerCode.globalOutbound).toBeNull();
  });
});
