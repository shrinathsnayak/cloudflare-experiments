export type HeadersResponse = {
  url: string;
  statusCode: number;
  statusText: string;
  method: "HEAD" | "GET";
  headers: Record<string, string>;
};
