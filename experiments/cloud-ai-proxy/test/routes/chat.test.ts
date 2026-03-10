import { describe, it, expect } from "vitest";
import worker from "../../src/index";

const mockEnv = {
  AI: {
    run: async () => ({ response: "Hello from AI" }),
  },
};

describe("POST /chat", () => {
  it("returns 200 and response when model and prompt are valid", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "@cf/meta/llama-3.1-8b-instruct-fast",
          prompt: "Say hello",
        }),
      }),
      mockEnv
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { response?: string };
    expect(body.response).toBe("Hello from AI");
  });

  it("returns 400 when model is missing", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Hi" }),
      }),
      mockEnv
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: string; code?: string };
    expect(body.code).toBe("MISSING_MODEL");
    expect(body.error).toBeDefined();
  });

  it("returns 400 when prompt and messages are both missing", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "@cf/meta/llama-3.1-8b-instruct-fast" }),
      }),
      mockEnv
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: string; code?: string };
    expect(body.code).toBe("MISSING_PROMPT");
    expect(body.error).toBeDefined();
  });

  it("returns 400 when body is not valid JSON", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
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

describe("GET /chat", () => {
  it("returns 200 and response when model and prompt are provided", async () => {
    const res = await worker.fetch(
      new Request(
        "http://localhost/chat?model=@cf/meta/llama-3.1-8b-instruct-fast&prompt=Say%20hi"
      ),
      mockEnv
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { response?: string };
    expect(body.response).toBe("Hello from AI");
  });

  it("returns 400 when model is missing", async () => {
    const res = await worker.fetch(new Request("http://localhost/chat?prompt=Hi"), mockEnv);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("MISSING_MODEL");
  });

  it("returns 400 when prompt is missing", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat?model=@cf/meta/llama-3.1-8b-instruct-fast"),
      mockEnv
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("MISSING_PROMPT");
  });
});
