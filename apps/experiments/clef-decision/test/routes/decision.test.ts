import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

const mockAI = {
  run: vi.fn().mockResolvedValue([
    { type: "noul", probability: 0.73 },
    { type: "choice", probabilities: [0.15, 0.65, 0.2] },
  ]),
};

describe("POST /decision", () => {
  it("returns 400 when body is invalid JSON", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/decision", {
        method: "POST",
        body: "not json",
      }),
      { AI: mockAI } as any
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe("INVALID_JSON");
  });

  it("returns 400 when state or questions are missing", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/decision", {
        method: "POST",
        body: JSON.stringify({ state: "test" }),
      }),
      { AI: mockAI } as any
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe("INVALID_REQUEST");
  });

  it("returns 200 with decision result when valid", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/decision", {
        method: "POST",
        body: JSON.stringify({
          state: "test state",
          questions: [{ type: "noul", question: "Will it rain?" }],
        }),
      }),
      { AI: mockAI } as any
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { model: string; answers: any[] };
    expect(body.model).toBe("@cf/cloudflare/clef");
    expect(body.answers).toBeDefined();
  });
});
