import { RELAY_ID_PATTERN } from "../constants/defaults";
import type { CapturedRequest, CapturedRequestSummary } from "../types/relay";

export function validateRelayId(id: string | undefined): string | null {
  if (!id || typeof id !== "string") return null;
  const trimmed = id.trim();
  if (!RELAY_ID_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function buildInboundUrl(origin: string, id: string): string {
  return `${origin.replace(/\/$/, "")}/relay/${id}`;
}

export function headersToRecord(headers: Headers): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

export function queryToRecord(searchParams: URLSearchParams): Record<string, string> {
  const record: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

export async function readRequestBody(request: Request, maxBytes: number): Promise<string | null> {
  if (request.method === "GET" || request.method === "HEAD") {
    return null;
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > maxBytes) {
    return `[body omitted: ${contentLength} bytes exceeds ${maxBytes} byte limit]`;
  }

  const buffer = await request.arrayBuffer();
  if (buffer.byteLength > maxBytes) {
    return `[body omitted: ${buffer.byteLength} bytes exceeds ${maxBytes} byte limit]`;
  }

  if (buffer.byteLength === 0) {
    return null;
  }

  return new TextDecoder().decode(buffer);
}

export async function buildCapturedRequest(
  request: Request,
  maxBytes: number
): Promise<CapturedRequest> {
  const url = new URL(request.url);
  const body = await readRequestBody(request, maxBytes);

  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    method: request.method,
    path: url.pathname,
    query: queryToRecord(url.searchParams),
    headers: headersToRecord(request.headers),
    body,
  };
}

export function summarizeRequest(record: CapturedRequest): CapturedRequestSummary {
  return {
    id: record.id,
    timestamp: record.timestamp,
    method: record.method,
    path: record.path,
  };
}

export function sortSummariesNewestFirst(
  summaries: CapturedRequestSummary[]
): CapturedRequestSummary[] {
  return [...summaries].sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
  );
}
