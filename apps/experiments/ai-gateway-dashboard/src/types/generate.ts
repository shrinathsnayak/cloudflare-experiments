export type GenerateRequest = {
  prompt?: string;
  compareCache?: boolean;
};

export type GatewayMetadata = {
  id: string;
  model: string;
  latencyMs: number;
  cacheStatus: "HIT" | "MISS" | "BYPASS" | "UNKNOWN";
  skipCache: boolean;
};

export type CacheComparison = {
  cached: Pick<GatewayMetadata, "latencyMs" | "cacheStatus" | "skipCache">;
  skipCache: Pick<GatewayMetadata, "latencyMs" | "cacheStatus" | "skipCache">;
  latencyDeltaMs: number;
};

export type GenerateResponse = {
  response: string;
  gateway: GatewayMetadata;
  cacheComparison?: CacheComparison;
};
