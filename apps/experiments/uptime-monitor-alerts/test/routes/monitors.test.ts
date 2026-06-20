import { describe, it, expect, vi, beforeEach } from "vitest";
import worker from "../../src/index";

function createMockDb() {
  const monitors = new Map<number, Record<string, unknown>>();
  const checks = new Map<number, Array<Record<string, unknown>>>();
  const alerts: Array<Record<string, unknown>> = [];
  let nextMonitorId = 1;
  let nextCheckId = 1;

  function createStatement(query: string, args: unknown[] = []) {
    return {
      async run() {
        if (query.startsWith("INSERT INTO monitors")) {
          const id = nextMonitorId++;
          monitors.set(id, {
            id,
            url: args[0],
            alert_email: args[1],
            last_status: null,
            created_at: 1_700_000_000,
          });
          return { meta: { changes: 1 } };
        }
        if (query.startsWith("DELETE FROM monitors")) {
          const id = Number(args[0]);
          const existed = monitors.delete(id);
          return { meta: { changes: existed ? 1 : 0 } };
        }
        if (query.startsWith("INSERT INTO checks")) {
          const monitorId = Number(args[0]);
          const list = checks.get(monitorId) ?? [];
          list.unshift({
            id: nextCheckId++,
            monitor_id: monitorId,
            ok: args[1],
            status_code: args[2],
            response_time_ms: args[3],
            error: args[4],
            checked_at: 1_700_000_100 + list.length,
          });
          checks.set(monitorId, list);
          return { meta: { changes: 1 } };
        }
        if (query.startsWith("INSERT INTO alerts")) {
          alerts.push({
            monitor_id: args[0],
            alert_email: args[1],
            sent: args[2],
            error: args[3],
          });
          return { meta: { changes: 1 } };
        }
        if (query.startsWith("UPDATE monitors SET last_status")) {
          const monitor = monitors.get(Number(args[1]));
          if (monitor) monitor.last_status = args[0];
          return { meta: { changes: 1 } };
        }
        return { meta: { changes: 0 } };
      },
      async first<T>() {
        if (query.includes("FROM monitors ORDER BY id DESC LIMIT 1")) {
          const latest = [...monitors.values()].at(-1);
          return (latest ?? null) as T;
        }
        if (query.includes("FROM monitors WHERE id = ?")) {
          return (monitors.get(Number(args[0])) ?? null) as T;
        }
        return null;
      },
      async all<T>() {
        if (query.includes("FROM monitors ORDER BY id ASC")) {
          return { results: [...monitors.values()] as T[] };
        }
        if (query.includes("FROM checks WHERE monitor_id = ?")) {
          return { results: (checks.get(Number(args[0])) ?? []) as T[] };
        }
        return { results: [] as T[] };
      },
    };
  }

  return {
    monitors,
    checks,
    alerts,
    prepare(query: string) {
      const statement = {
        bind(...args: unknown[]) {
          return createStatement(query, args);
        },
        run: () => createStatement(query).run(),
        first: <T>() => createStatement(query).first<T>(),
        all: <T>() => createStatement(query).all<T>(),
      };
      return statement;
    },
  };
}

vi.mock("../../src/lib/fetch", () => ({
  fetchWithTiming: vi.fn(),
}));

import { fetchWithTiming } from "../../src/lib/fetch";
import { runMonitorChecks } from "../../src/lib/monitor";

describe("monitor routes", () => {
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    vi.mocked(fetchWithTiming).mockReset();
  });

  const env = () =>
    ({
      DB: mockDb,
      EMAILER: {
        send: vi.fn().mockResolvedValue({ messageId: "test-message" }),
      },
      ALERT_FROM_EMAIL: "alerts@example.com",
    }) as unknown as import("../../src/types/env").Env;

  it("POST /monitors creates a monitor", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://example.com",
          alertEmail: "ops@example.com",
        }),
      }),
      env()
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as { id: number; alertEmail: string };
    expect(body.id).toBe(1);
    expect(body.alertEmail).toBe("ops@example.com");
  });

  it("GET /monitors/:id/history returns uptime stats", async () => {
    await worker.fetch(
      new Request("http://localhost/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://example.com",
          alertEmail: "ops@example.com",
        }),
      }),
      env()
    );

    mockDb.checks.set(1, [
      {
        id: 1,
        monitor_id: 1,
        ok: 1,
        status_code: 200,
        response_time_ms: 40,
        error: null,
        checked_at: 1_700_000_200,
      },
      {
        id: 2,
        monitor_id: 1,
        ok: 0,
        status_code: 500,
        response_time_ms: 80,
        error: "HTTP 500",
        checked_at: 1_700_000_100,
      },
    ]);

    const res = await worker.fetch(new Request("http://localhost/monitors/1/history"), env());
    expect(res.status).toBe(200);
    const body = (await res.json()) as { uptimePercent: number; totalChecks: number };
    expect(body.totalChecks).toBe(2);
    expect(body.uptimePercent).toBe(50);
  });

  it("records failed alert in D1 when email send fails", async () => {
    mockDb.monitors.set(1, {
      id: 1,
      url: "https://example.com",
      alert_email: "ops@example.com",
      last_status: "up",
      created_at: 1_700_000_000,
    });

    vi.mocked(fetchWithTiming).mockResolvedValue({
      ok: false,
      statusCode: 0,
      responseTimeMs: 50,
      error: "network failure",
    });

    const testEnv = env();
    vi.mocked(testEnv.EMAILER.send).mockRejectedValue(new Error("email rejected"));

    const result = await runMonitorChecks(testEnv);
    expect(result.alerts).toBe(1);
    expect(mockDb.alerts[0]?.sent).toBe(0);
    expect(mockDb.alerts[0]?.error).toBe("email rejected");
  });

  it("scheduled checks send alert on up to down transition", async () => {
    mockDb.monitors.set(1, {
      id: 1,
      url: "https://example.com",
      alert_email: "ops@example.com",
      last_status: "up",
      created_at: 1_700_000_000,
    });

    vi.mocked(fetchWithTiming).mockResolvedValue({
      ok: false,
      statusCode: 503,
      responseTimeMs: 120,
      error: "Service unavailable",
    });

    const testEnv = env();
    const result = await runMonitorChecks(testEnv);
    expect(result.processed).toBe(1);
    expect(result.alerts).toBe(1);
    expect(testEnv.EMAILER.send).toHaveBeenCalledOnce();
    expect(mockDb.alerts).toHaveLength(1);
    expect(mockDb.alerts[0]?.sent).toBe(1);
  });
});

describe("smoke", () => {
  it("GET / returns 200 with app info", async () => {
    const res = await worker.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name?: string; description?: string };
    expect(body.name).toBe("uptime-monitor-alerts");
    expect(body.description).toBeDefined();
  });
});
