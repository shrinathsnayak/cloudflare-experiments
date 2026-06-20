export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type CreateMockRequest = {
  path: string;
  method: string;
  status: number;
  body: unknown;
  delayMs?: number;
};

export type MockConfig = {
  slug: string;
  path: string;
  method: HttpMethod;
  status: number;
  body: unknown;
  delayMs?: number;
  createdAt: string;
};

export type MockSummary = Pick<
  MockConfig,
  "slug" | "path" | "method" | "status" | "delayMs" | "createdAt"
>;
