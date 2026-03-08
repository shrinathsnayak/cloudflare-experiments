export interface TestResponse {
  status: number;
  latency: number;
  ok: boolean;
  error?: string;
}
