import { describe, it, expect } from "vitest";
import { validateDomain } from "../../src/lib/domain";
import { analyzeSpf, analyzeDmarc, parseMx } from "../../src/lib/analyze";

describe("validateDomain", () => {
  it("accepts bare domains", () => {
    expect(validateDomain("example.com")).toBe("example.com");
    expect(validateDomain("mail.example.co.uk")).toBe("mail.example.co.uk");
  });

  it("accepts https URLs", () => {
    expect(validateDomain("https://Example.COM/path")).toBe("example.com");
  });

  it("rejects invalid input", () => {
    expect(validateDomain(undefined)).toBe(null);
    expect(validateDomain("")).toBe(null);
    expect(validateDomain("not a domain")).toBe(null);
    expect(validateDomain("ftp://example.com")).toBe(null);
  });
});

describe("analyzeSpf", () => {
  it("detects missing SPF", () => {
    expect(analyzeSpf(["v=other"]).status).toBe("missing");
  });

  it("passes good SPF", () => {
    expect(analyzeSpf(["v=spf1 include:_spf.google.com -all"]).status).toBe("pass");
  });

  it("warns on +all", () => {
    expect(analyzeSpf(["v=spf1 +all"]).status).toBe("warn");
  });
});

describe("analyzeDmarc", () => {
  it("warns on p=none", () => {
    const result = analyzeDmarc(["v=DMARC1; p=none;"]);
    expect(result.status).toBe("warn");
    expect(result.policy).toBe("none");
  });

  it("passes reject policy", () => {
    expect(analyzeDmarc(["v=DMARC1; p=reject;"]).status).toBe("pass");
  });
});

describe("parseMx", () => {
  it("parses priority and exchange", () => {
    expect(parseMx(["10 aspmx.l.google.com."])).toEqual([
      { priority: 10, exchange: "aspmx.l.google.com" },
    ]);
  });
});
