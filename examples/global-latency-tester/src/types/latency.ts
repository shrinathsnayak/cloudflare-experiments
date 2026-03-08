export interface LatencyResponse {
  url: string;
  /** Latency in ms from this edge colo */
  latencyMs: number;
  /** Cloudflare colo code (e.g. LHR, NRT) */
  colo: string;
  statusCode: number;
}

export interface ColoLatencySummary {
  colo: string;
  minLatencyMs: number;
  avgLatencyMs: number;
  maxLatencyMs: number;
  count: number;
  statusCode: number;
}

export interface GlobalLatencyResponse {
  url: string;
  /** One entry per colo that handled the self-checks */
  byColo: ColoLatencySummary[];
  /** Total number of samples (self-checks) */
  sampleCount: number;
}
