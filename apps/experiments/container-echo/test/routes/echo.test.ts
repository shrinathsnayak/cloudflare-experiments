import { describe, it, expect, vi } from "vitest";
import echoRoutes from "../../src/routes/echo";

describe("echo routes", () => {
  it("POST /echo returns container response via mocked binding", async () => {
    const stub = {
      fetch: vi.fn(async () => Response.json({ echo: "hello", port: 8080 })),
    };
    const env = {
      ECHO: {
        getByName: vi.fn(() => stub),
        idFromName: vi.fn(),
        get: vi.fn(),
      },
    };

    const res = await echoRoutes.fetch(
      new Request("http://localhost/echo", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "hello",
      }),
      env as never
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { echo: string; port: number };
    expect(body.echo).toBe("hello");
    expect(body.port).toBe(8080);
  });

  it("rejects empty body", async () => {
    const env = {
      ECHO: {
        getByName: vi.fn(),
      },
    };

    const res = await echoRoutes.fetch(
      new Request("http://localhost/echo", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "",
      }),
      env as never
    );

    expect(res.status).toBe(400);
  });
});
