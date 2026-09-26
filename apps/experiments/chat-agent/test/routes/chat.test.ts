import { describe, it, expect, vi } from "vitest";
import chatRoutes from "../../src/routes/chat";
import type { Env } from "../../src/types/env";

function createEnv(
  stubFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
): Env {
  return {
    CHAT_AGENT: {
      idFromName: (name: string) => ({ toString: () => name }) as DurableObjectId,
      get: () =>
        ({
          fetch: stubFetch,
        }) as unknown as DurableObjectStub,
    } as unknown as DurableObjectNamespace,
  };
}

describe("chat routes", () => {
  it("rejects missing sessionId on GET /chat", async () => {
    const res = await chatRoutes.fetch(
      new Request("http://localhost/chat"),
      createEnv(async () => {
        return new Response("{}");
      })
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_SESSION");
  });

  it("returns history from the durable object", async () => {
    const messages = [
      {
        id: 1,
        role: "user",
        content: "hello",
        createdAt: "2025-01-01T00:00:00.000Z",
      },
    ];
    const env = createEnv(async () => Response.json({ sessionId: "room-1", messages }));

    const res = await chatRoutes.fetch(new Request("http://localhost/chat?sessionId=room-1"), env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sessionId: string; messages: unknown[] };
    expect(body.sessionId).toBe("room-1");
    expect(body.messages).toEqual(messages);
  });

  it("posts a message through the durable object", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe("POST");
      return Response.json({
        sessionId: "room-1",
        messages: [
          { id: 1, role: "user", content: "hi", createdAt: "2025-01-01T00:00:00.000Z" },
          {
            id: 2,
            role: "assistant",
            content: "agent: hi",
            createdAt: "2025-01-01T00:00:01.000Z",
          },
        ],
      });
    });

    const res = await chatRoutes.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: "room-1", message: "hi" }),
      }),
      createEnv(fetchMock)
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { messages: Array<{ content: string }> };
    expect(body.messages.at(-1)?.content).toBe("agent: hi");
  });
});
