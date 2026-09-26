import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

describe("GET /secret/status", () => {
  it("returns preview when configured", async () => {
    const get = vi.fn().mockResolvedValue("ab-secret-xyz");
    const res = await worker.fetch(new Request("http://localhost/secret/status"), {
      API_KEY: { get },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      configured?: boolean;
      length?: number;
      preview?: string;
    };
    expect(body.configured).toBe(true);
    expect(body.length).toBe(13);
    expect(body.preview).toBe("ab***");
    expect(JSON.stringify(body)).not.toContain("secret-xyz");
  });

  it("returns configured false when get throws", async () => {
    const get = vi.fn().mockRejectedValue(new Error("missing"));
    const res = await worker.fetch(new Request("http://localhost/secret/status"), {
      API_KEY: { get },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { configured?: boolean };
    expect(body.configured).toBe(false);
  });
});

describe("GET /secret/verify", () => {
  it("returns match true when expected equals secret", async () => {
    const get = vi.fn().mockResolvedValue("tok_123");
    const res = await worker.fetch(new Request("http://localhost/secret/verify?expected=tok_123"), {
      API_KEY: { get },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { match?: boolean };
    expect(body.match).toBe(true);
  });

  it("returns match false when expected differs", async () => {
    const get = vi.fn().mockResolvedValue("tok_123");
    const res = await worker.fetch(new Request("http://localhost/secret/verify?expected=other"), {
      API_KEY: { get },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { match?: boolean };
    expect(body.match).toBe(false);
  });

  it("returns 400 when expected is missing", async () => {
    const get = vi.fn().mockResolvedValue("tok_123");
    const res = await worker.fetch(new Request("http://localhost/secret/verify"), {
      API_KEY: { get },
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("MISSING_PARAM");
  });
});
