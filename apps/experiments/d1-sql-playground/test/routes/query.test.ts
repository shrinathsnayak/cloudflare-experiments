import { describe, it, expect, vi } from "vitest";
import queryRoutes from "../../src/routes/query";

function mockDb(rows: Record<string, unknown>[]) {
  return {
    prepare: vi.fn().mockReturnValue({
      all: vi.fn().mockResolvedValue({ results: rows, success: true }),
    }),
  } as unknown as D1Database;
}

describe("query routes", () => {
  it("POST /query returns rows and column metadata", async () => {
    const db = mockDb([
      { id: 1, name: "Edge Cache Starter Kit", category: "Platform", price: 29.99, in_stock: 1 },
    ]);

    const res = await queryRoutes.fetch(
      new Request("http://localhost/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: "SELECT * FROM products LIMIT 1" }),
      }),
      { DB: db }
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      columns: { name: string; type: string }[];
      rows: Record<string, unknown>[];
      rowCount: number;
      durationMs: number;
    };
    expect(body.rowCount).toBe(1);
    expect(body.columns.map((column) => column.name)).toEqual([
      "id",
      "name",
      "category",
      "price",
      "in_stock",
    ]);
    expect(body.rows[0].name).toBe("Edge Cache Starter Kit");
  });

  it("POST /query rejects invalid SQL", async () => {
    const db = mockDb([]);

    const res = await queryRoutes.fetch(
      new Request("http://localhost/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: "DELETE FROM products" }),
      }),
      { DB: db }
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("INVALID_SQL");
  });

  it("POST /query returns QUERY_ERROR when D1 fails", async () => {
    const db = {
      prepare: vi.fn().mockReturnValue({
        all: vi.fn().mockRejectedValue(new Error("no such column: missing")),
      }),
    } as unknown as D1Database;

    const res = await queryRoutes.fetch(
      new Request("http://localhost/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: "SELECT missing FROM products" }),
      }),
      { DB: db }
    );

    expect(res.status).toBe(502);
    const body = (await res.json()) as { code: string; error: string };
    expect(body.code).toBe("QUERY_ERROR");
    expect(body.error).toContain("no such column");
  });
});
