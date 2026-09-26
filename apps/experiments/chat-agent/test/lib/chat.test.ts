import { describe, it, expect } from "vitest";
import {
  mapSqlRowsToMessages,
  stubAgentReply,
  validateMessage,
  validateSessionId,
  generateReply,
} from "../../src/lib/chat";

describe("chat lib", () => {
  it("validates session ids", () => {
    expect(validateSessionId("room-1")).toBe("room-1");
    expect(validateSessionId("")).toBeNull();
    expect(validateSessionId("bad id")).toBeNull();
  });

  it("validates messages", () => {
    expect(validateMessage("hello")).toBe("hello");
    expect(validateMessage("   ")).toBeNull();
    expect(validateMessage(undefined)).toBeNull();
  });

  it("builds stub agent replies", () => {
    expect(stubAgentReply("hi")).toBe("agent: hi");
  });

  it("falls back to stub when AI is missing", async () => {
    await expect(generateReply(undefined, "ping")).resolves.toBe("agent: ping");
  });

  it("maps sql rows to chat messages", () => {
    expect(
      mapSqlRowsToMessages([
        { id: 1, role: "user", content: "hi", created_at: "2025-01-01T00:00:00.000Z" },
        { id: 2, role: "assistant", content: "agent: hi", created_at: "2025-01-01T00:00:01.000Z" },
      ])
    ).toEqual([
      { id: 1, role: "user", content: "hi", createdAt: "2025-01-01T00:00:00.000Z" },
      { id: 2, role: "assistant", content: "agent: hi", createdAt: "2025-01-01T00:00:01.000Z" },
    ]);
  });
});
