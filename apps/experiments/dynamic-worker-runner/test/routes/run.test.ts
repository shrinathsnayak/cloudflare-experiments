import { describe, it, expect, vi } from "vitest";
import runRoutes from "../../src/routes/run";
import type { Env } from "../../src/types/env";

describe("run routes", () => {
  it("POST /run executes via LOADER mock", async () => {
    const env: Env = {
      LOADER: {
        get: vi.fn(() => ({
          getEntrypoint: () => ({
            fetch: async () => Response.json({ result: 42 }),
          }),
        })),
      },
    };

    const code = "export default { async fetch() { return Response.json({ result: 42 }); } }";
    const res = await runRoutes.fetch(
      new Request("http://localhost/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      }),
      env
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: number; body: { result: number } };
    expect(body.status).toBe(200);
    expect(body.body.result).toBe(42);
  });

  it("rejects empty code with INVALID_CODE", async () => {
    const env: Env = {
      LOADER: {
        get: vi.fn(),
      },
    };

    const res = await runRoutes.fetch(
      new Request("http://localhost/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "" }),
      }),
      env
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("INVALID_CODE");
  });

  it("returns RUN_ERROR when loader throws", async () => {
    const env: Env = {
      LOADER: {
        get: vi.fn(() => {
          throw new Error("isolate failed");
        }),
      },
    };

    const res = await runRoutes.fetch(
      new Request("http://localhost/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "export default { async fetch() { return new Response('ok'); } }",
        }),
      }),
      env
    );

    expect(res.status).toBe(502);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("RUN_ERROR");
  });
});
