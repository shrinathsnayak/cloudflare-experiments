import { describe, it, expect } from "vitest";
import worker from "../../src/index";
import { computeHmacSha256 } from "../../src/lib/verify";

describe("POST /verify", () => {
  it("returns 400 for invalid body", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: "only-payload" }),
      })
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("INVALID_BODY");
  });

  it("verifies a valid webhook signature", async () => {
    const payload = '{"event":"ping"}';
    const secret = "s3cret";
    const signature = `sha256=${await computeHmacSha256(payload, secret)}`;

    const res = await worker.fetch(
      new Request("http://localhost/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, secret, signature }),
      })
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { match: boolean };
    expect(body.match).toBe(true);
  });
});
