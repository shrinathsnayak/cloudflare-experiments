import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

describe("api routes", () => {
  it("GET /api/hello returns worker message", async () => {
    const res = await worker.fetch(new Request("http://localhost/api/hello"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { message?: string; servedBy?: string };
    expect(body.message).toBe("Hello from the Worker");
    expect(body.servedBy).toBe("worker");
  });

  it("GET /api/info reports assetsBinding when ASSETS is present", async () => {
    const mockEnv = {
      ASSETS: {
        fetch: vi.fn(async () => new Response("asset")),
      },
    };

    const res = await worker.fetch(new Request("http://localhost/api/info"), mockEnv);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name?: string; assetsBinding?: boolean };
    expect(body.name).toBe("static-assets-spa");
    expect(body.assetsBinding).toBe(true);
  });

  it("catch-all proxies to ASSETS when bound", async () => {
    const assetsFetch = vi.fn(async () => new Response("<html>spa</html>", { status: 200 }));
    const mockEnv = {
      ASSETS: { fetch: assetsFetch },
    };

    const req = new Request("http://localhost/app.js");
    const res = await worker.fetch(req, mockEnv);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("<html>spa</html>");
    expect(assetsFetch).toHaveBeenCalledTimes(1);
  });

  it("catch-all returns 404 when ASSETS is missing", async () => {
    const res = await worker.fetch(new Request("http://localhost/missing-page"));
    expect(res.status).toBe(404);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("NOT_FOUND");
  });
});
