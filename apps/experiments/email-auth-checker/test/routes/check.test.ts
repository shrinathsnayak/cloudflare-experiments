import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

vi.mock("../../src/lib/analyze", () => ({
  checkEmailAuth: vi.fn().mockResolvedValue({
    domain: "example.com",
    mx: [{ priority: 10, exchange: "mail.example.com" }],
    spf: { status: "pass", record: "v=spf1 -all", detail: "SPF record present" },
    dmarc: {
      status: "pass",
      record: "v=DMARC1; p=reject;",
      policy: "reject",
      detail: "DMARC policy is reject",
    },
    dkim: {
      status: "warn",
      selectorsChecked: ["google"],
      found: [{ selector: "google", found: false }],
      detail: "No DKIM keys found",
    },
    summary: { status: "warn", issues: ["No DKIM keys found"] },
  }),
}));

describe("GET /check", () => {
  it("returns 400 when domain is missing", async () => {
    const res = await worker.fetch(new Request("http://localhost/check"));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("INVALID_DOMAIN");
  });

  it("returns auth analysis for a valid domain", async () => {
    const res = await worker.fetch(new Request("http://localhost/check?domain=example.com"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { domain: string; summary: { status: string } };
    expect(body.domain).toBe("example.com");
    expect(body.summary.status).toBe("warn");
  });
});
