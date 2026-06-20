export type CacheStatus = "HIT" | "MISS" | "BYPASS";

export type FetchResponse = {
  url: string;
  cacheStatus: CacheStatus;
  statusCode: number;
  contentType: string | null;
  bodySize: number;
};
