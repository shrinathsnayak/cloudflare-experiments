import { describe, it, expect, vi, beforeEach } from "vitest";

const pingDatabase = vi.fn();
const runSelectQuery = vi.fn();

vi.mock("../../src/lib/db", () => ({
  pingDatabase: (...args: unknown[]) => pingDatabase(...args),
  runSelectQuery: (...args: unknown[]) => runSelectQuery(...args),
}));

import worker from "../../src/index";

const env = {
  HYPERDRIVE: {
    connectionString: "postgres://alice:secret@db.example.com:5432/app",
  },
};

function fetchWithEnv(path: string, init?: RequestInit) {
  return worker.fetch(new Request(`http://localhost${path}`, init), env);
}

describe("hyperdrive routes", () => {
  beforeEach(() => {
    pingDatabase.mockReset();
    runSelectQuery.mockReset();
  });

  it("GET /status redacts connection metadata", async () => {
    const res = await fetchWithEnv("/status");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { host: string; user: string };
    expect(body.host).toBe("db.example.com:5432");
    expect(body.user).toBe("alice");
  });

  it("GET /ping returns db info", async () => {
    pingDatabase.mockResolvedValue({
      ok: true,
      database: "app",
      user: "alice",
      serverVersion: "PostgreSQL 16",
      latencyMs: 12,
    });
    const res = await fetchWithEnv("/ping");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { database: string };
    expect(body.database).toBe("app");
  });

  it("POST /query rejects invalid SQL", async () => {
    const res = await fetchWithEnv("/query", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sql: "DELETE FROM users" }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("INVALID_SQL");
  });

  it("POST /query runs select", async () => {
    runSelectQuery.mockResolvedValue({
      sql: "SELECT 1 AS ok",
      rowCount: 1,
      rows: [{ ok: 1 }],
      latencyMs: 5,
    });
    const res = await fetchWithEnv("/query", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sql: "SELECT 1 AS ok" }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { rowCount: number };
    expect(body.rowCount).toBe(1);
  });
});
