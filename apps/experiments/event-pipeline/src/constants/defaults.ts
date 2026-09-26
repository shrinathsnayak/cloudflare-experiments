export const MAX_EVENTS = 100;

export const SAMPLE_EVENT = {
  type: "page_view",
  timestamp: "2026-01-15T12:00:00.000Z",
  userId: "user_123",
  properties: {
    path: "/home",
    referrer: "https://example.com",
  },
} as const;
