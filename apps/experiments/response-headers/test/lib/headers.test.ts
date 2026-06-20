import { describe, it, expect, vi } from "vitest";
import { inspectResponseHeaders } from "../../src/lib/headers";

describe("inspectResponseHeaders", () => {
  it("uses HEAD by default", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "text/html" },
      })
    );

    const result = await inspectResponseHeaders("https://example.com");

    expect(result.method).toBe("HEAD");
    expect(result.statusCode).toBe(200);
    expect(result.headers["content-type"]).toBe("text/html");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to GET when HEAD is not allowed", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 405 }))
      .mockResolvedValueOnce(
        new Response("ok", {
          status: 200,
          headers: { "content-type": "text/plain" },
        })
      );

    const result = await inspectResponseHeaders("https://example.com");

    expect(result.method).toBe("GET");
    expect(result.statusCode).toBe(200);
  });
});
