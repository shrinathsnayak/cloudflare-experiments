export interface Env {}

export type LatencyResponse = {
  url: string;
  responseTimeMs: number;
  statusCode: number;
  colo: string | null;
  city: string | null;
  country: string | null;
  timestamp: string;
  limitation: string;
  tip: string;
};
