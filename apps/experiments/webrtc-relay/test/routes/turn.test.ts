import { describe, it, expect, vi, afterEach } from "vitest";
import turnRoutes from "../../src/routes/turn";

describe("turn routes", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns demo credentials when secrets are missing", async () => {
    const res = await turnRoutes.fetch(
      new Request("http://localhost/turn-credentials?ttl=3600"),
      {}
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      mode: string;
      ttl: number;
      iceServers: Array<{ username?: string }>;
      note?: string;
    };
    expect(body.mode).toBe("demo");
    expect(body.ttl).toBe(3600);
    expect(body.iceServers[0]?.username).toBe("demo");
    expect(body.note).toContain("REALTIME_APP_ID");
  });

  it("rejects invalid ttl", async () => {
    const res = await turnRoutes.fetch(new Request("http://localhost/ice-servers?ttl=10"), {});
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_TTL");
  });

  it("calls Cloudflare TURN API when configured", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          iceServers: [
            {
              urls: ["turn:turn.cloudflare.com:3478?transport=udp"],
              username: "live-user",
              credential: "live-cred",
            },
          ],
        })
      )
    );

    const res = await turnRoutes.fetch(new Request("http://localhost/turn-credentials"), {
      REALTIME_APP_ID: "key-id",
      TURN_API_TOKEN: "secret",
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      mode: string;
      iceServers: Array<{ username?: string }>;
    };
    expect(body.mode).toBe("live");
    expect(body.iceServers[0]?.username).toBe("live-user");
  });
});
