import { describe, it, expect, vi } from "vitest";
import {
  demoPollResponse,
  demoQueuedResponse,
  hasAIBinding,
  pollBatch,
  resolveModel,
  submitBatch,
  validateRequestId,
  validateTexts,
} from "../../src/lib/batch";
import type { AIRunBinding } from "../../src/types/env";

describe("batch lib", () => {
  it("resolves model with fallback", () => {
    expect(resolveModel("@cf/baai/bge-small-en-v1.5")).toBe("@cf/baai/bge-small-en-v1.5");
    expect(resolveModel("")).toBe("@cf/baai/bge-m3");
    expect(resolveModel(undefined)).toBe("@cf/baai/bge-m3");
  });

  it("validates texts arrays", () => {
    expect(validateTexts({ texts: ["hello", "world"] })).toEqual(["hello", "world"]);
    expect(validateTexts({ texts: [] })).toBeNull();
    expect(validateTexts({ texts: ["a".repeat(2001)] })).toBeNull();
    expect(validateTexts({ texts: [""] })).toBeNull();
    expect(validateTexts({ texts: Array.from({ length: 21 }, (_, i) => `t${i}`) })).toBeNull();
    expect(validateTexts({ texts: [1, 2] as unknown as string[] })).toBeNull();
    expect(validateTexts(null)).toBeNull();
  });

  it("validates request ids", () => {
    expect(validateRequestId("abc-123")).toBe("abc-123");
    expect(validateRequestId("demo-uuid")).toBe("demo-uuid");
    expect(validateRequestId("")).toBeNull();
    expect(validateRequestId("bad id")).toBeNull();
    expect(validateRequestId(undefined)).toBeNull();
  });

  it("detects AI binding presence", () => {
    expect(hasAIBinding({ run: vi.fn() })).toBe(true);
    expect(hasAIBinding({})).toBe(false);
    expect(hasAIBinding(undefined)).toBe(false);
    expect(hasAIBinding(null)).toBe(false);
  });

  it("builds demo responses", () => {
    const queued = demoQueuedResponse("@cf/baai/bge-m3");
    expect(queued.status).toBe("queued");
    expect(queued.mode).toBe("demo");
    expect(queued.request_id.startsWith("demo-")).toBe(true);

    const poll = demoPollResponse("demo-1", "@cf/baai/bge-m3");
    expect(poll.status).toBe("completed");
    expect(poll.mode).toBe("demo");
    expect(poll.request_id).toBe("demo-1");
  });

  it("submits a batch via AI.run with queueRequest", async () => {
    const run = vi.fn().mockResolvedValue({
      status: "queued",
      model: "@cf/baai/bge-m3",
      request_id: "req-1",
    });
    const ai: AIRunBinding = { run };

    const result = await submitBatch(ai, "@cf/baai/bge-m3", ["a", "b"]);
    expect(result).toEqual({
      status: "queued",
      model: "@cf/baai/bge-m3",
      request_id: "req-1",
      mode: "live",
    });
    expect(run).toHaveBeenCalledWith(
      "@cf/baai/bge-m3",
      { requests: [{ text: "a" }, { text: "b" }] },
      { queueRequest: true }
    );
  });

  it("polls a batch via AI.run with request_id", async () => {
    const run = vi.fn().mockResolvedValue({
      status: "running",
      request_id: "req-1",
    });
    const ai: AIRunBinding = { run };

    const result = await pollBatch(ai, "@cf/baai/bge-m3", "req-1");
    expect(result.status).toBe("running");
    expect(result.mode).toBe("live");
    expect(run).toHaveBeenCalledWith("@cf/baai/bge-m3", { request_id: "req-1" });
  });
});
