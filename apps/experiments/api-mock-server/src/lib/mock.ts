import {
  ALLOWED_METHODS,
  MAX_DELAY_MS,
  MAX_PATH_LENGTH,
  MOCK_KEY_PREFIX,
  SLUG_LENGTH,
} from "../constants/defaults";
import type { CreateMockRequest, HttpMethod, MockConfig, MockSummary } from "../types/mock";

const SLUG_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function mockKey(slug: string): string {
  return `${MOCK_KEY_PREFIX}${slug}`;
}

export function validateSlug(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 64) return null;
  if (!/^[a-z0-9-]+$/.test(trimmed)) return null;
  return trimmed;
}

export function validatePath(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_PATH_LENGTH) return null;
  if (!trimmed.startsWith("/")) return null;
  return trimmed;
}

export function validateMethod(input: string | undefined): HttpMethod | null {
  if (!input || typeof input !== "string") return null;
  const normalized = input.trim().toUpperCase();
  if (!ALLOWED_METHODS.includes(normalized as HttpMethod)) return null;
  return normalized as HttpMethod;
}

export function validateStatus(input: unknown): number | null {
  if (typeof input !== "number" || !Number.isInteger(input)) return null;
  if (input < 100 || input > 599) return null;
  return input;
}

export function validateJsonBody(input: unknown): unknown | null {
  if (input === undefined) return null;
  if (input === null) return null;
  if (typeof input === "object") return input;
  if (typeof input === "string" || typeof input === "number" || typeof input === "boolean") {
    return input;
  }
  return null;
}

export function validateDelayMs(input: unknown): number | undefined | null {
  if (input === undefined) return undefined;
  if (typeof input !== "number" || !Number.isInteger(input)) return null;
  if (input < 0 || input > MAX_DELAY_MS) return null;
  return input;
}

export function validateCreateMockRequest(body: CreateMockRequest): {
  path: string;
  method: HttpMethod;
  status: number;
  body: unknown;
  delayMs?: number;
} | null {
  const path = validatePath(body.path);
  const method = validateMethod(body.method);
  const status = validateStatus(body.status);
  const responseBody = validateJsonBody(body.body);
  const delayMs = validateDelayMs(body.delayMs);

  if (!path || !method || status === null || responseBody === null || delayMs === null) {
    return null;
  }

  return { path, method, status, body: responseBody, delayMs };
}

export function generateSlug(): string {
  const bytes = new Uint8Array(SLUG_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => SLUG_ALPHABET[byte % SLUG_ALPHABET.length]).join("");
}

export async function saveMock(kv: KVNamespace, config: MockConfig): Promise<void> {
  await kv.put(mockKey(config.slug), JSON.stringify(config));
}

export async function getMock(kv: KVNamespace, slug: string): Promise<MockConfig | null> {
  const raw = await kv.get(mockKey(slug));
  if (!raw) return null;
  return parseMockConfig(raw, slug);
}

export async function deleteMock(kv: KVNamespace, slug: string): Promise<void> {
  await kv.delete(mockKey(slug));
}

export async function listMocks(kv: KVNamespace): Promise<MockSummary[]> {
  const listed = await kv.list({ prefix: MOCK_KEY_PREFIX });
  const summaries: MockSummary[] = [];

  for (const key of listed.keys) {
    const slug = key.name.slice(MOCK_KEY_PREFIX.length);
    const raw = await kv.get(key.name);
    if (!raw) continue;
    const config = parseMockConfig(raw, slug);
    if (!config) continue;
    summaries.push({
      slug: config.slug,
      path: config.path,
      method: config.method,
      status: config.status,
      delayMs: config.delayMs,
      createdAt: config.createdAt,
    });
  }

  return summaries.sort((a, b) => a.slug.localeCompare(b.slug));
}

export function parseMockConfig(raw: string, slug: string): MockConfig | null {
  try {
    const parsed = JSON.parse(raw) as Partial<MockConfig>;
    const method = validateMethod(parsed.method);
    const status = validateStatus(parsed.status);
    const path = validatePath(parsed.path);
    const body = validateJsonBody(parsed.body);

    if (!method || status === null || !path || body === null) return null;

    return {
      slug: parsed.slug ?? slug,
      path,
      method,
      status,
      body,
      delayMs: parsed.delayMs,
      createdAt: parsed.createdAt ?? new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export function matchesMockRequest(
  config: MockConfig,
  requestMethod: string,
  requestPath: string
): boolean {
  if (config.method !== requestMethod.toUpperCase()) return false;

  const normalizedRequestPath = normalizePath(requestPath);
  const normalizedConfigPath = normalizePath(config.path);

  if (normalizedRequestPath === normalizedConfigPath) return true;
  if (normalizedRequestPath.startsWith(`${normalizedConfigPath}/`)) return true;

  return false;
}

export function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

export async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function buildMockResponse(config: MockConfig): Response {
  return Response.json(config.body, { status: config.status });
}
