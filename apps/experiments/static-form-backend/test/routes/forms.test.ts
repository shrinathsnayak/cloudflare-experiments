import { describe, it, expect, beforeEach } from "vitest";
import worker from "../../src/index";
import type { Env } from "../../src/types/env";
import { createMockDb } from "../helpers/mock-db";

describe("admin form routes", () => {
  let db: ReturnType<typeof createMockDb>;
  const env = () => ({ DB: db, ADMIN_TOKEN: "admin-secret" }) as unknown as Env;
  const auth = { Authorization: "Bearer admin-secret", "Content-Type": "application/json" };

  beforeEach(() => {
    db = createMockDb();
  });

  it("POST /forms requires the admin token", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerEmail: "owner@example.com" }),
      }),
      env()
    );
    expect(res.status).toBe(401);
    expect(((await res.json()) as { code: string }).code).toBe("UNAUTHORIZED");
  });

  it("POST /forms creates a form", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/forms", {
        method: "POST",
        headers: auth,
        body: JSON.stringify({
          ownerEmail: "Owner@Example.com",
          allowedOrigin: "https://site.example/contact",
          redirectUrl: "https://site.example/thanks",
        }),
      }),
      env()
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as { id: string; endpoint: string; allowedOrigin: string };
    expect(body.allowedOrigin).toBe("https://site.example");
    expect(body.endpoint).toBe(`http://localhost/f/${body.id}`);
    expect(db.forms.get(body.id)?.owner_email).toBe("owner@example.com");
  });

  it("POST /forms validates fields", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/forms", {
        method: "POST",
        headers: auth,
        body: JSON.stringify({
          ownerEmail: "owner@example.com",
          redirectUrl: "javascript:alert(1)",
        }),
      }),
      env()
    );
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe("INVALID_URL");
  });

  it("GET /forms/:id/submissions lists latest submissions", async () => {
    db.forms.set("form1", {
      id: "form1",
      owner_email: "owner@example.com",
      allowed_origin: null,
      redirect_url: null,
      created_at: 1_700_000_000,
    });
    db.submissions.push({
      id: 1,
      form_id: "form1",
      fields: JSON.stringify({ name: "Ada" }),
      ip_hash: "abc",
      user_agent: "test",
      created_at: 1_700_000_100,
    });

    const res = await worker.fetch(
      new Request("http://localhost/forms/form1/submissions", { headers: auth }),
      env()
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { submissions: Array<{ fields: Record<string, string> }> };
    expect(body.submissions[0].fields).toEqual({ name: "Ada" });
  });

  it("GET /forms/:id/submissions returns 404 for unknown forms", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/forms/nope/submissions", { headers: auth }),
      env()
    );
    expect(res.status).toBe(404);
  });
});
