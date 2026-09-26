import { describe, it, expect, vi, afterEach } from "vitest";
import worker from "../../src/index";
import { DEMO_ROWS } from "../../src/constants/defaults";
import type { Env } from "../../src/types/env";

function emptyEnv(): Env {
  return {};
}

function liveEnv(): Env {
  return {
    CLOUDFLARE_ACCOUNT_ID: "acct123",
    R2_SQL_AUTH_TOKEN: "secret-token",
    WAREHOUSE: "live-warehouse",
  };
}

describe("query routes", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns INVALID_QUERY when query is missing", async () => {
    const res = await worker.fetch(new Request("http://localhost/query"), emptyEnv());
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_QUERY");
  });

  it("returns FORBIDDEN_SQL for INSERT", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/query?q=INSERT+INTO+t+VALUES+(1)"),
      emptyEnv()
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("FORBIDDEN_SQL");
  });

  it("returns demo mode sample rows without secrets", async () => {
    const res = await worker.fetch(
      new Request(
        "http://localhost/query?q=" + encodeURIComponent("SELECT * FROM default.t LIMIT 10")
      ),
      emptyEnv()
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      mode?: string;
      rows?: unknown[];
      warehouse?: string;
    };
    expect(body.mode).toBe("demo");
    expect(body.rows).toEqual([...DEMO_ROWS]);
    expect(body.warehouse).toBe("demo-warehouse");
  });

  it("POST /query accepts JSON body", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "SELECT * FROM default.ecommerce LIMIT 5",
          warehouse: "custom-wh",
        }),
      }),
      emptyEnv()
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { mode?: string; warehouse?: string; query?: string };
    expect(body.mode).toBe("demo");
    expect(body.warehouse).toBe("custom-wh");
    expect(body.query).toBe("SELECT * FROM default.ecommerce LIMIT 5");
  });

  it("returns live results when fetch succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ result: { rows: [{ n: 42 }] } }), { status: 200 })
      );
    vi.stubGlobal("fetch", fetchMock);

    const res = await worker.fetch(
      new Request("http://localhost/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "SELECT 42 AS n" }),
      }),
      liveEnv()
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { mode?: string; rows?: unknown[]; warehouse?: string };
    expect(body.mode).toBe("live");
    expect(body.rows).toEqual([{ n: 42 }]);
    expect(body.warehouse).toBe("live-warehouse");
    expect(fetchMock).toHaveBeenCalled();
  });

  it("returns QUERY_ERROR when upstream fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("upstream boom", { status: 500 }))
    );

    const res = await worker.fetch(
      new Request("http://localhost/query?q=" + encodeURIComponent("SELECT 1")),
      liveEnv()
    );

    expect(res.status).toBe(502);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("QUERY_ERROR");
  });
});
