export type CapturedRequest = {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: string | null;
};

export type CapturedRequestSummary = {
  id: string;
  timestamp: string;
  method: string;
  path: string;
};

export type RelaySessionMeta = {
  id: string;
  createdAt: string;
};

export type NewRelayResponse = {
  id: string;
  inboundUrl: string;
};

export type CaptureResponse = {
  requestId: string;
  captured: true;
  timestamp: string;
};
