import { describe, it, expect } from "vitest";
import worker from "../../src/index";

const mockVector = [0.1, 0.2, 0.3];

const mockEnv = {
  AI: {
    run: async () => ({ data: [mockVector] }),
  },
  VECTORIZE: {
    upsert: async () => ({ mutationId: "test-mutation" }),
    query: async () => ({
      matches: [{ id: "doc-1", score: 0.9, metadata: { text: "edge workers" } }],
    }),
  },
};

describe("POST /upsert", () => {
  it("returns 200 when id and text are valid", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "doc-1", text: "Cloudflare Workers at the edge" }),
      }),
      mockEnv
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { id?: string };
    expect(body.id).toBe("doc-1");
  });

  it("returns 400 when id is missing", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "hello" }),
      }),
      mockEnv
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_ID");
  });

  it("returns 400 when body is not valid JSON", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      }),
      mockEnv
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_BODY");
  });
});

describe("GET /search", () => {
  it("returns 200 with results when query is valid", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/search?q=edge%20workers"),
      mockEnv
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      query?: string;
      results?: Array<{ id: string; score: number; text: string }>;
    };
    expect(body.query).toBe("edge workers");
    expect(body.results).toHaveLength(1);
    expect(body.results?.[0].id).toBe("doc-1");
    expect(body.results?.[0].text).toBe("edge workers");
  });

  it("returns 400 when q is missing", async () => {
    const res = await worker.fetch(new Request("http://localhost/search"), mockEnv);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_QUERY");
  });

  it("returns 400 when topK is invalid", async () => {
    const res = await worker.fetch(new Request("http://localhost/search?q=hello&topK=99"), mockEnv);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_TOP_K");
  });
});
