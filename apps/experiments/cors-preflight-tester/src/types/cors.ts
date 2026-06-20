export type CorsHeaderCheck = {
  header: string;
  present: boolean;
  value: string | null;
  status: "ok" | "missing" | "misconfigured";
  detail: string;
};

export type CorsTestRequest = {
  url: string;
  origin: string;
  method: string;
  headers?: string[];
};

export type CorsTestResponse = {
  url: string;
  origin: string;
  method: string;
  requestedHeaders: string[];
  statusCode: number;
  responseTimeMs: number;
  checks: CorsHeaderCheck[];
  valid: boolean;
};
