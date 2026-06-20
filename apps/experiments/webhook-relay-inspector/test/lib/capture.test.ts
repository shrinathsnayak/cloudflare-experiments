import { describe, it, expect } from "vitest";
import {
  buildCapturedRequest,
  buildInboundUrl,
  headersToRecord,
  queryToRecord,
  sortSummariesNewestFirst,
  summarizeRequest,
  validateRelayId,
} from "../../src/lib/capture";

describe("validateRelayId", () => {
  it("accepts UUID relay ids", () => {
    expect(validateRelayId("550e8400-e29b-41d4-a716-446655440000")).toBe(
      "550e8400-e29b-41d4-a716-446655440000"
    );
  });

  it("rejects invalid relay ids", () => {
    expect(validateRelayId("abc")).toBeNull();
    expect(validateRelayId("")).toBeNull();
  });
});

describe("buildInboundUrl", () => {
  it("builds relay capture URL", () => {
    expect(buildInboundUrl("https://example.com", "550e8400-e29b-41d4-a716-446655440000")).toBe(
      "https://example.com/relay/550e8400-e29b-41d4-a716-446655440000"
    );
  });
});

describe("headersToRecord", () => {
  it("converts headers to a plain object", () => {
    const headers = new Headers({ "content-type": "application/json", "x-test": "1" });
    expect(headersToRecord(headers)).toEqual({
      "content-type": "application/json",
      "x-test": "1",
    });
  });
});

describe("queryToRecord", () => {
  it("converts search params to a plain object", () => {
    const params = new URLSearchParams("a=1&b=2");
    expect(queryToRecord(params)).toEqual({ a: "1", b: "2" });
  });
});

describe("buildCapturedRequest", () => {
  it("captures method, headers, query, and body", async () => {
    const request = new Request("https://relay/capture?source=webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-event": "payment.created",
      },
      body: JSON.stringify({ ok: true }),
    });

    const captured = await buildCapturedRequest(request, 10_000);
    expect(captured.method).toBe("POST");
    expect(captured.path).toBe("/capture");
    expect(captured.query).toEqual({ source: "webhook" });
    expect(captured.headers["content-type"]).toBe("application/json");
    expect(captured.body).toBe('{"ok":true}');
    expect(captured.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it("returns null body for GET requests", async () => {
    const request = new Request("https://relay/capture", { method: "GET" });
    const captured = await buildCapturedRequest(request, 10_000);
    expect(captured.body).toBeNull();
  });
});

describe("summarizeRequest", () => {
  it("returns list-friendly request metadata", async () => {
    const request = new Request("https://relay/capture", { method: "PUT", body: "secret" });
    const captured = await buildCapturedRequest(request, 10_000);
    expect(summarizeRequest(captured)).toEqual({
      id: captured.id,
      timestamp: captured.timestamp,
      method: "PUT",
      path: "/capture",
    });
  });
});

describe("sortSummariesNewestFirst", () => {
  it("sorts summaries by timestamp descending", () => {
    const sorted = sortSummariesNewestFirst([
      {
        id: "1",
        timestamp: "2024-01-01T00:00:00.000Z",
        method: "POST",
        path: "/relay/a",
      },
      {
        id: "2",
        timestamp: "2024-01-02T00:00:00.000Z",
        method: "POST",
        path: "/relay/b",
      },
    ]);

    expect(sorted.map((item) => item.id)).toEqual(["2", "1"]);
  });
});
