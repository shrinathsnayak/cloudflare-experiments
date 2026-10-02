import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import worker from "../../src/index";
import type { Env } from "../../src/types/env";
import { createMockDb } from "../helpers/mock-db";

describe("POST /f/:formId", () => {
  let db: ReturnType<typeof createMockDb>;
  let send: ReturnType<typeof vi.fn>;
  let limit: ReturnType<typeof vi.fn>;
  const fetchMock = vi.fn();

  const env = (overrides: Partial<Env> = {}) =>
    ({
      DB: db,
      EMAIL: { send },
      FORM_RATE_LIMITER: { limit },
      FROM_EMAIL: "forms@example.com",
      TURNSTILE_SECRET_KEY: "secret",
      ...overrides,
    }) as unknown as Env;

  function submit(
    body: string,
    headers: Record<string, string> = {},
    contentType = "application/x-www-form-urlencoded"
  ) {
    return new Request("http://localhost/f/form1", {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        Origin: "https://site.example",
        "CF-Connecting-IP": "203.0.113.7",
        ...headers,
      },
      body,
    });
  }

  beforeEach(() => {
    db = createMockDb();
    db.forms.set("form1", {
      id: "form1",
      owner_email: "owner@example.com",
      allowed_origin: "https://site.example",
      redirect_url: "https://site.example/thanks",
      created_at: 1_700_000_000,
    });
    send = vi.fn().mockResolvedValue({ messageId: "m1" });
    limit = vi.fn().mockResolvedValue({ success: true });
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(Response.json({ success: true }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores, emails, and returns JSON", async () => {
    const res = await worker.fetch(
      submit("name=Ada&email=ada%40example.com&cf-turnstile-response=tok"),
      env()
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true, id: 1, turnstile: "passed", emailed: true });
    expect(JSON.parse(db.submissions[0].fields)).toEqual({ name: "Ada", email: "ada@example.com" });
    expect(db.submissions[0].ip_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(db.submissions[0].ip_hash).not.toContain("203.0.113.7");
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ to: "owner@example.com", replyTo: "ada@example.com" })
    );
    expect(limit).toHaveBeenCalledWith({ key: "203.0.113.7" });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://site.example");
  });

  it("redirects HTML form posts with 303", async () => {
    const res = await worker.fetch(
      submit("name=Ada&cf-turnstile-response=tok", { Accept: "text/html,*/*" }),
      env()
    );
    expect(res.status).toBe(303);
    expect(res.headers.get("Location")).toBe("https://site.example/thanks");
  });

  it("returns 404 for unknown forms", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/f/missing", { method: "POST" }),
      env()
    );
    expect(res.status).toBe(404);
  });

  it("enforces the allowed origin", async () => {
    const res = await worker.fetch(submit("name=Ada", { Origin: "https://evil.example" }), env());
    expect(res.status).toBe(403);
    expect(((await res.json()) as { code: string }).code).toBe("ORIGIN_NOT_ALLOWED");
  });

  it("returns 429 when rate limited", async () => {
    limit.mockResolvedValue({ success: false });
    const res = await worker.fetch(submit("name=Ada"), env());
    expect(res.status).toBe(429);
    expect(((await res.json()) as { code: string }).code).toBe("RATE_LIMITED");
  });

  it("silently drops honeypot submissions", async () => {
    const res = await worker.fetch(submit("name=Bot&_gotcha=spam"), env());
    expect(res.status).toBe(201);
    expect(db.submissions).toHaveLength(0);
    expect(send).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requires a Turnstile token when the secret is set", async () => {
    const res = await worker.fetch(submit("name=Ada"), env());
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe("MISSING_TURNSTILE_TOKEN");
  });

  it("rejects failed Turnstile verification", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ success: false, "error-codes": ["invalid-input-response"] })
    );
    const res = await worker.fetch(submit("name=Ada&cf-turnstile-response=bad"), env());
    expect(res.status).toBe(403);
    expect(((await res.json()) as { code: string }).code).toBe("TURNSTILE_FAILED");
  });

  it("returns 502 when siteverify is unreachable", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const res = await worker.fetch(submit("name=Ada&cf-turnstile-response=tok"), env());
    expect(res.status).toBe(502);
  });

  it("skips Turnstile when no secret is configured", async () => {
    const res = await worker.fetch(
      submit(JSON.stringify({ name: "Ada" }), {}, "application/json"),
      env({ TURNSTILE_SECRET_KEY: undefined })
    );
    expect(res.status).toBe(201);
    expect(((await res.json()) as { turnstile: string }).turnstile).toBe("skipped");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("still succeeds when the email fails", async () => {
    send.mockRejectedValue(new Error("not verified"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const res = await worker.fetch(submit("name=Ada&cf-turnstile-response=tok"), env());
    expect(res.status).toBe(201);
    expect(((await res.json()) as { emailed: boolean }).emailed).toBe(false);
    expect(db.submissions).toHaveLength(1);
  });

  it("rejects empty submissions", async () => {
    const res = await worker.fetch(submit("cf-turnstile-response=tok"), env());
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe("EMPTY_SUBMISSION");
  });

  it("answers CORS preflight", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/f/form1", {
        method: "OPTIONS",
        headers: {
          Origin: "https://site.example",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "content-type",
        },
      }),
      env()
    );
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://site.example");
  });
});
