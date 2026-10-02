import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Env } from "../../src/types/env";
import type { DomainStatus } from "../../src/types/domain";
import { createMockDb } from "../helpers/mock-db";

vi.mock("../../src/lib/expiry", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/lib/expiry")>();
  return { ...actual, checkDomain: vi.fn() };
});

import worker from "../../src/index";
import { checkDomain } from "../../src/lib/expiry";
import { runReminderChecks } from "../../src/lib/reminders";

function status(regDays: number | null, certDays: number | null): DomainStatus {
  return {
    domain: "example.com",
    checkedAt: "2026-10-01T00:00:00.000Z",
    registration:
      regDays === null
        ? null
        : { expiresAt: "2026-10-31T00:00:00.000Z", daysLeft: regDays, registrar: "Reg" },
    certificate:
      certDays === null
        ? null
        : { expiresAt: "2026-10-08T00:00:00.000Z", daysLeft: certDays, issuer: "LE" },
  };
}

describe("domain routes", () => {
  let db: ReturnType<typeof createMockDb>;
  let send: ReturnType<typeof vi.fn>;
  const env = () =>
    ({ DB: db, EMAIL: { send }, ALERT_FROM_EMAIL: "r@example.com" }) as unknown as Env;

  beforeEach(() => {
    db = createMockDb();
    send = vi.fn().mockResolvedValue({ messageId: "m1" });
    vi.mocked(checkDomain).mockReset();
  });

  it("POST /domains creates a watched domain", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: "Example.com", alertEmail: "ops@example.com" }),
      }),
      env()
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as { id: number; domain: string };
    expect(body).toMatchObject({ id: 1, domain: "example.com" });
  });

  it("POST /domains rejects URLs", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: "https://example.com", alertEmail: "ops@example.com" }),
      }),
      env()
    );
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe("INVALID_DOMAIN");
  });

  it("GET /domains/:id returns live status and persists it", async () => {
    db.domains.set(1, {
      id: 1,
      domain: "example.com",
      alert_email: "ops@example.com",
      registration_expires_at: null,
      certificate_expires_at: null,
      last_checked_at: null,
      created_at: 1_700_000_000,
    });
    vi.mocked(checkDomain).mockResolvedValue(status(30, 7));

    const res = await worker.fetch(new Request("http://localhost/domains/1"), env());
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: DomainStatus };
    expect(body.status.registration?.daysLeft).toBe(30);
    expect(db.domains.get(1)?.certificate_expires_at).toBe("2026-10-08T00:00:00.000Z");
  });

  it("GET /domains/:id returns 404 for unknown ids", async () => {
    const res = await worker.fetch(new Request("http://localhost/domains/9"), env());
    expect(res.status).toBe(404);
  });

  it("DELETE /domains/:id removes a domain", async () => {
    await worker.fetch(
      new Request("http://localhost/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: "example.com", alertEmail: "ops@example.com" }),
      }),
      env()
    );
    const res = await worker.fetch(
      new Request("http://localhost/domains/1", { method: "DELETE" }),
      env()
    );
    expect(res.status).toBe(200);
    expect(db.domains.size).toBe(0);
  });

  it("GET /lookup validates the domain", async () => {
    const res = await worker.fetch(new Request("http://localhost/lookup"), env());
    expect(res.status).toBe(400);
  });

  it("GET /lookup returns status without saving", async () => {
    vi.mocked(checkDomain).mockResolvedValue({
      ...status(100, null),
      errors: { certificate: "crt.sh: Request timed out" },
    });
    const res = await worker.fetch(
      new Request("http://localhost/lookup?domain=example.com"),
      env()
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as DomainStatus;
    expect(body.certificate).toBeNull();
    expect(body.errors?.certificate).toContain("timed out");
  });
});

describe("runReminderChecks", () => {
  it("sends each threshold once per expiry date", async () => {
    const db = createMockDb();
    const send = vi.fn().mockResolvedValue({ messageId: "m1" });
    const env = { DB: db, EMAIL: { send } } as unknown as Env;
    db.domains.set(1, {
      id: 1,
      domain: "example.com",
      alert_email: "ops@example.com",
      registration_expires_at: null,
      certificate_expires_at: null,
      last_checked_at: null,
      created_at: 1_700_000_000,
    });

    vi.mocked(checkDomain).mockResolvedValue(status(29, 45));
    expect((await runReminderChecks(env)).remindersSent).toBe(1);
    expect((await runReminderChecks(env)).remindersSent).toBe(0);

    vi.mocked(checkDomain).mockResolvedValue(status(6, 5));
    expect((await runReminderChecks(env)).remindersSent).toBe(2);

    expect(send).toHaveBeenCalledTimes(3);
    expect(db.reminders.map((r) => `${r.kind}:${r.threshold_days}`)).toEqual([
      "registration:30",
      "registration:7",
      "certificate:7",
    ]);
  });

  it("counts failures without stopping", async () => {
    const db = createMockDb();
    const env = { DB: db, EMAIL: { send: vi.fn() } } as unknown as Env;
    db.domains.set(1, {
      id: 1,
      domain: "example.com",
      alert_email: "ops@example.com",
      registration_expires_at: null,
      certificate_expires_at: null,
      last_checked_at: null,
      created_at: 1_700_000_000,
    });
    vi.mocked(checkDomain).mockRejectedValue(new Error("boom"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(await runReminderChecks(env)).toEqual({ processed: 1, remindersSent: 0, failures: 1 });
  });
});
