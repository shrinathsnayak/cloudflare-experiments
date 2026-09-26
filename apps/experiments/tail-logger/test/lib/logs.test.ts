import { describe, it, expect } from "vitest";
import { extractLogMessages, toTailLogEntry } from "../../src/lib/logs";

describe("toTailLogEntry", () => {
  it("maps TraceItem fields", () => {
    const entry = toTailLogEntry({
      scriptName: "producer",
      outcome: "ok",
      eventTimestamp: 1000,
      logs: [{ message: "hello", level: "info", timestamp: 1000 }],
      exceptions: [],
      diagnosticsChannelEvents: [],
    } as unknown as TraceItem);

    expect(entry).toEqual({
      scriptName: "producer",
      outcome: "ok",
      eventTimestamp: 1000,
      logs: ["hello"],
    });
  });
});

describe("extractLogMessages", () => {
  it("joins array messages", () => {
    const messages = extractLogMessages({
      outcome: "ok",
      logs: [{ message: ["a", 1], level: "log", timestamp: 1 }],
      exceptions: [],
      diagnosticsChannelEvents: [],
    } as unknown as TraceItem);
    expect(messages).toEqual(["a 1"]);
  });
});
