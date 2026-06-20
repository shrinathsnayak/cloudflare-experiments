import { describe, it, expect, vi, beforeEach } from "vitest";
import worker from "../../src/index";

function createMockDb() {
  const tracked = new Map<string, { id: number; url: string; created_at: number }>();
  const snapshots = new Map<number, Array<Record<string, unknown>>>();
  let nextTrackedId = 1;

  return {
    tracked,
    snapshots,
    prepare(query: string) {
      const statement = {
        bind(...args: unknown[]) {
          return {
            async run() {
              if (query.startsWith("INSERT INTO tracked_urls")) {
                const url = String(args[0]);
                if (tracked.has(url)) {
                  throw new Error("UNIQUE constraint failed: tracked_urls.url");
                }
                const row = { id: nextTrackedId++, url, created_at: 1_700_000_000 };
                tracked.set(url, row);
                return { meta: { changes: 1 } };
              }
              if (query.startsWith("DELETE FROM tracked_urls")) {
                const url = String(args[0]);
                const existed = tracked.delete(url);
                return { meta: { changes: existed ? 1 : 0 } };
              }
              if (query.startsWith("INSERT INTO snapshots")) {
                const trackedUrlId = Number(args[0]);
                const list = snapshots.get(trackedUrlId) ?? [];
                list.unshift({
                  id: list.length + 1,
                  tracked_url_id: trackedUrlId,
                  content_hash: args[1],
                  diff_summary: args[2],
                  r2_key: args[3],
                  created_at: 1_700_000_100 + list.length,
                });
                snapshots.set(trackedUrlId, list);
                return { meta: { changes: 1 } };
              }
              return { meta: { changes: 0 } };
            },
            async first<T>() {
              if (query.includes("FROM tracked_urls WHERE url = ?")) {
                return (tracked.get(String(args[0])) ?? null) as T;
              }
              if (query.includes("ORDER BY created_at DESC LIMIT 1")) {
                const trackedUrlId = Number(args[0]);
                const list = snapshots.get(trackedUrlId) ?? [];
                return (list[0] ?? null) as T;
              }
              return null;
            },
            async all<T>() {
              if (query.includes("FROM tracked_urls ORDER BY id ASC")) {
                return { results: [...tracked.values()] as T[] };
              }
              if (query.includes("FROM snapshots WHERE tracked_url_id = ?")) {
                const trackedUrlId = Number(args[0]);
                return { results: (snapshots.get(trackedUrlId) ?? []) as T[] };
              }
              return { results: [] as T[] };
            },
          };
        },
      };
      return statement;
    },
  };
}

describe("track routes", () => {
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
  });

  const env = () =>
    ({
      DB: mockDb,
      SNAPSHOTS: {
        put: vi.fn(),
        get: vi.fn(),
      },
      BROWSER: {} as Fetcher,
    }) as unknown as import("../../src/types/env").Env;

  it("POST /track registers a URL", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com" }),
      }),
      env()
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as { url: string; id: number };
    expect(body.url).toBe("https://example.com/");
    expect(body.id).toBe(1);
  });

  it("DELETE /track removes a tracked URL", async () => {
    await worker.fetch(
      new Request("http://localhost/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com" }),
      }),
      env()
    );

    const res = await worker.fetch(
      new Request("http://localhost/track?url=https://example.com", { method: "DELETE" }),
      env()
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { removed: boolean };
    expect(body.removed).toBe(true);
  });

  it("GET /history returns 404 for unknown URL", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/history?url=https://missing.example"),
      env()
    );
    expect(res.status).toBe(404);
  });
});

describe("smoke", () => {
  it("GET / returns 200 with app info", async () => {
    const res = await worker.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name?: string; description?: string };
    expect(body.name).toBe("website-change-tracker");
    expect(body.description).toBeDefined();
  });
});
