import { describe, it, expect, vi, beforeEach } from "vitest";
import worker from "../../src/index";

const mockEnv = {
  TURNSTILE_SECRET_KEY: "test-secret-key",
};

describe("POST /verify", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 502 when secret is missing", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "abc123" }),
      }),
      {}
    );

    expect(res.status).toBe(502);
    const body = (await res.json()) as { error?: string; code?: string };
    expect(body.code).toBe("MISSING_SECRET");
  });

  it("returns 400 when token is missing", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
      mockEnv
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: string; code?: string };
    expect(body.code).toBe("INVALID_TOKEN");
  });

  it("returns siteverify result on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: true,
            hostname: "example.com",
            action: "login",
          }),
          { status: 200 }
        )
      )
    );

    const res = await worker.fetch(
      new Request("http://localhost/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "valid-token" }),
      }),
      mockEnv
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success?: boolean;
      hostname?: string;
      action?: string;
    };
    expect(body.success).toBe(true);
    expect(body.hostname).toBe("example.com");
    expect(body.action).toBe("login");
  });

  it("returns error codes when verification fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: false,
            "error-codes": ["invalid-input-response"],
          }),
          { status: 200 }
        )
      )
    );

    const res = await worker.fetch(
      new Request("http://localhost/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "bad-token" }),
      }),
      mockEnv
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { success?: boolean; errorCodes?: string[] };
    expect(body.success).toBe(false);
    expect(body.errorCodes).toEqual(["invalid-input-response"]);
  });

  it("returns 400 when body is not valid JSON", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      }),
      mockEnv
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_BODY");
  });
});
