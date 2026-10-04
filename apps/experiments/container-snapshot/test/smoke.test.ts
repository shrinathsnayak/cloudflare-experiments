import { describe, it, expect } from "vitest";
import worker from "../src/index";

describe("smoke", () => {
  it("GET / returns 200 with app info", async () => {
    const mockNamespace = {
      idFromName: vi.fn().mockReturnValue("test-id"),
      get: vi.fn().mockReturnValue({
        snapshot: vi.fn(),
        restore: vi.fn(),
      }),
    };

    const res = await worker.fetch(new Request("http://localhost/"), {
      SNAPSHOT_DEMO: mockNamespace,
    } as any);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name?: string; description?: string };
    expect(body.name).toBe("container-snapshot");
    expect(body.description).toBeDefined();
  });
});
