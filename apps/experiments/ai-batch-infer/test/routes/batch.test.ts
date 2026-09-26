import { describe, it, expect, vi } from "vitest";
import batchRoutes from "../../src/routes/batch";
import type { Env } from "../../src/types/env";

describe("batch routes", () => {
  it("returns INVALID_BODY when texts are missing", async () => {
    const env = { MODEL: "@cf/baai/bge-m3" } satisfies Env;
    const res = await batchRoutes.fetch(
      new Request("http://localhost/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
      env
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_BODY");
  });

  it("returns demo queued response when AI is missing", async () => {
    const env = { MODEL: "@cf/baai/bge-m3" } satisfies Env;
    const res = await batchRoutes.fetch(
      new Request("http://localhost/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: ["hello", "world"] }),
      }),
      env
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      status: string;
      mode?: string;
      request_id: string;
    };
    expect(body.status).toBe("queued");
    expect(body.mode).toBe("demo");
    expect(body.request_id).toMatch(/^demo-/);
  });

  it("queues a live batch via AI.run", async () => {
    const run = vi.fn().mockResolvedValue({
      status: "queued",
      model: "@cf/baai/bge-m3",
      request_id: "live-1",
    });
    const env = {
      AI: { run },
      MODEL: "@cf/baai/bge-m3",
    } satisfies Env;

    const res = await batchRoutes.fetch(
      new Request("http://localhost/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: ["alpha", "beta"] }),
      }),
      env
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      status: string;
      request_id: string;
      mode?: string;
    };
    expect(body.status).toBe("queued");
    expect(body.request_id).toBe("live-1");
    expect(body.mode).toBe("live");
    expect(run).toHaveBeenCalled();
  });

  it("returns BATCH_ERROR when submit throws", async () => {
    const env = {
      AI: { run: vi.fn().mockRejectedValue(new Error("upstream failed")) },
      MODEL: "@cf/baai/bge-m3",
    } satisfies Env;

    const res = await batchRoutes.fetch(
      new Request("http://localhost/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: ["fail"] }),
      }),
      env
    );
    expect(res.status).toBe(502);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("BATCH_ERROR");
  });

  it("returns INVALID_REQUEST_ID for bad path param", async () => {
    const env = { MODEL: "@cf/baai/bge-m3" } satisfies Env;
    const res = await batchRoutes.fetch(new Request("http://localhost/batch/bad%20id"), env);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_REQUEST_ID");
  });

  it("polls live results via AI.run", async () => {
    const run = vi.fn().mockResolvedValue({
      responses: [{ id: 0, success: true }],
    });
    const env = {
      AI: { run },
      MODEL: "@cf/baai/bge-m3",
    } satisfies Env;

    const res = await batchRoutes.fetch(new Request("http://localhost/batch/req-42"), env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { mode?: string; responses?: unknown[] };
    expect(body.mode).toBe("live");
    expect(body.responses).toEqual([{ id: 0, success: true }]);
    expect(run).toHaveBeenCalledWith("@cf/baai/bge-m3", { request_id: "req-42" });
  });

  it("returns demo poll when AI is missing", async () => {
    const env = { MODEL: "@cf/baai/bge-m3" } satisfies Env;
    const res = await batchRoutes.fetch(new Request("http://localhost/batch/demo-abc"), env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { mode?: string; status?: string };
    expect(body.mode).toBe("demo");
    expect(body.status).toBe("completed");
  });
});
