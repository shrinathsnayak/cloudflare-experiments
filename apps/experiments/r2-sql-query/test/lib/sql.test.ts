import { describe, it, expect, vi, afterEach } from "vitest";
import {
  demoQueryResult,
  isConfigured,
  resolveWarehouse,
  runQuery,
  validateSql,
} from "../../src/lib/sql";
import { DEMO_ROWS, MAX_QUERY_LENGTH } from "../../src/constants/defaults";
import type { Env } from "../../src/types/env";

describe("validateSql", () => {
  it("allows SELECT", () => {
    const result = validateSql("  SELECT * FROM default.t LIMIT 10  ");
    expect(result).toEqual({
      ok: true,
      query: "SELECT * FROM default.t LIMIT 10",
    });
  });

  it("allows SHOW", () => {
    expect(validateSql("SHOW TABLES").ok).toBe(true);
  });

  it("rejects INSERT", () => {
    const result = validateSql("INSERT INTO t VALUES (1)");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("FORBIDDEN_SQL");
    }
  });

  it("rejects UPDATE, DELETE, DROP", () => {
    expect(validateSql("UPDATE t SET x=1").ok).toBe(false);
    expect(validateSql("DELETE FROM t").ok).toBe(false);
    expect(validateSql("DROP TABLE t").ok).toBe(false);
  });

  it("rejects empty and oversized queries", () => {
    expect(validateSql("")).toMatchObject({ ok: false, code: "INVALID_QUERY" });
    expect(validateSql("   ")).toMatchObject({ ok: false, code: "INVALID_QUERY" });
    expect(validateSql("SELECT " + "x".repeat(MAX_QUERY_LENGTH))).toMatchObject({
      ok: false,
      code: "INVALID_QUERY",
    });
  });
});

describe("config helpers", () => {
  it("isConfigured requires account id and token", () => {
    expect(isConfigured({})).toBe(false);
    expect(isConfigured({ CLOUDFLARE_ACCOUNT_ID: "acc" })).toBe(false);
    expect(isConfigured({ CLOUDFLARE_ACCOUNT_ID: "acc", R2_SQL_AUTH_TOKEN: "tok" })).toBe(true);
  });

  it("resolveWarehouse prefers override then env", () => {
    const env: Env = { WAREHOUSE: "from-var", R2_BUCKET_NAME: "from-bucket" };
    expect(resolveWarehouse(env, "override")).toBe("override");
    expect(resolveWarehouse(env)).toBe("from-var");
    expect(resolveWarehouse({ R2_BUCKET_NAME: "bucket-only" })).toBe("bucket-only");
    expect(resolveWarehouse({})).toBe("demo-warehouse");
  });
});

describe("runQuery", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns demo rows when secrets are missing", async () => {
    const result = await runQuery({}, "SELECT * FROM default.t LIMIT 10");
    expect(result.mode).toBe("demo");
    expect(result.rows).toEqual([...DEMO_ROWS]);
    expect(result.note).toBeDefined();
  });

  it("fetches live results when configured", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ rows: [{ id: 1 }] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const env: Env = {
      CLOUDFLARE_ACCOUNT_ID: "acct123",
      R2_SQL_AUTH_TOKEN: "secret",
      WAREHOUSE: "my-wh",
    };

    const result = await runQuery(env, "SELECT id FROM default.t");
    expect(result.mode).toBe("live");
    expect(result.rows).toEqual([{ id: 1 }]);
    expect(result.warehouse).toBe("my-wh");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.sql.cloudflarestorage.com/api/v1/accounts/acct123/r2-sql/query/my-wh",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer secret",
        }),
      })
    );
  });

  it("demoQueryResult shapes sample payload", () => {
    const demo = demoQueryResult("SELECT 1", "demo-warehouse");
    expect(demo.mode).toBe("demo");
    expect(demo.rows.length).toBeGreaterThan(0);
  });
});
