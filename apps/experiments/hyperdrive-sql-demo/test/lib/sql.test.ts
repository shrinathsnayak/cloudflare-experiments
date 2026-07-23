import { describe, it, expect } from "vitest";
import { validateSelectSql, redactConnectionString } from "../../src/lib/sql";

describe("validateSelectSql", () => {
  it("accepts simple selects", () => {
    expect(validateSelectSql("SELECT 1 AS ok")).toBe("SELECT 1 AS ok");
  });

  it("rejects writes and multi-statements", () => {
    expect(validateSelectSql("DELETE FROM users")).toBe(null);
    expect(validateSelectSql("SELECT 1; DROP TABLE x")).toBe(null);
  });
});

describe("redactConnectionString", () => {
  it("extracts host database user", () => {
    expect(redactConnectionString("postgres://alice:secret@db.example.com:5432/app")).toEqual({
      host: "db.example.com:5432",
      database: "app",
      user: "alice",
    });
  });
});
