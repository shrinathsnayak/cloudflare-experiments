import { describe, it, expect, vi } from "vitest";
import emailRoutes from "../../src/routes/send";
import type { Env, SendEmail } from "../../src/types/env";

function createEnv(send: SendEmail["send"]): Env {
  return {
    EMAIL: { send },
    FROM_EMAIL: "noreply@example.com",
  };
}

describe("send routes", () => {
  it("rejects invalid to addresses", async () => {
    const res = await emailRoutes.fetch(
      new Request("http://localhost/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: "bad", subject: "Hi", text: "Hello" }),
      }),
      createEnv(vi.fn())
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_TO");
  });

  it("rejects missing body content", async () => {
    const res = await emailRoutes.fetch(
      new Request("http://localhost/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: "user@example.com", subject: "Hi" }),
      }),
      createEnv(vi.fn())
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("MISSING_BODY");
  });

  it("sends email through the EMAIL binding", async () => {
    const send = vi.fn().mockResolvedValue({ messageId: "msg-1" });
    const res = await emailRoutes.fetch(
      new Request("http://localhost/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "user@example.com",
          subject: "Welcome",
          text: "Hello there",
        }),
      }),
      createEnv(send)
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { sent: boolean; messageId?: string };
    expect(body.sent).toBe(true);
    expect(body.messageId).toBe("msg-1");
    expect(send).toHaveBeenCalledWith({
      from: "noreply@example.com",
      to: "user@example.com",
      subject: "Welcome",
      text: "Hello there",
      html: undefined,
    });
  });

  it("returns SEND_ERROR when the binding throws", async () => {
    const send = vi.fn().mockRejectedValue(new Error("quota exceeded"));
    const res = await emailRoutes.fetch(
      new Request("http://localhost/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "user@example.com",
          subject: "Welcome",
          html: "<p>Hi</p>",
        }),
      }),
      createEnv(send)
    );
    expect(res.status).toBe(502);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("SEND_ERROR");
  });
});
