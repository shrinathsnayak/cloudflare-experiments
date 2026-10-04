export interface CheckResponse {
  status: "reachable" | "unreachable";
  responseTime?: number;
  statusCode?: number;
  /** Cloudflare edge colo (IATA code) that served this check */
  colo?: string;
  error?: string;
}

export interface CheckQuery {
  url: string;
}
