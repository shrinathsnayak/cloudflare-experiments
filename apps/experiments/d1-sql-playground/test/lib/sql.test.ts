import { describe, it, expect } from "vitest";
import { extractTableNames, validateSelectSql } from "../../src/lib/sql";

describe("validateSelectSql", () => {
  it("accepts a simple SELECT against an allowed table", () => {
    expect(validateSelectSql("SELECT * FROM products LIMIT 10")).toBe(
      "SELECT * FROM products LIMIT 10"
    );
  });

  it("accepts JOIN queries across allowed tables", () => {
    const sql =
      "SELECT p.name, e.category FROM products p JOIN experiments e ON p.category = e.category";
    expect(validateSelectSql(sql)).toBe(sql);
  });

  it("rejects non-SELECT statements", () => {
    expect(validateSelectSql("DELETE FROM products")).toBe(null);
    expect(validateSelectSql("INSERT INTO products (name) VALUES ('x')")).toBe(null);
  });

  it("rejects semicolons and comments", () => {
    expect(validateSelectSql("SELECT * FROM products; DROP TABLE products")).toBe(null);
    expect(validateSelectSql("SELECT * FROM products -- hidden")).toBe(null);
    expect(validateSelectSql("SELECT * FROM products /* hidden */")).toBe(null);
  });

  it("rejects queries against disallowed tables", () => {
    expect(validateSelectSql("SELECT * FROM secrets")).toBe(null);
  });

  it("rejects UNION-based exfiltration", () => {
    expect(validateSelectSql("SELECT name FROM products UNION SELECT slug FROM experiments")).toBe(
      null
    );
  });

  it("rejects SELECT without a FROM clause", () => {
    expect(validateSelectSql("SELECT 1")).toBe(null);
  });
});

describe("extractTableNames", () => {
  it("collects table names from FROM and JOIN", () => {
    expect(extractTableNames("SELECT * FROM products JOIN experiments ON 1=1")).toEqual([
      "products",
      "experiments",
    ]);
  });
});
