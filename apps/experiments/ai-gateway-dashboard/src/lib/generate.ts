import { DEFAULT_MODEL, GATEWAY_ID } from "../constants/defaults";
import type { Env } from "../types/env";
import type { CacheComparison, GatewayMetadata, GenerateResponse } from "../types/generate";

type AiGatewayRunOptions = {
  gateway: {
    id: string;
    skipCache?: boolean;
  };
};

type AiRunResult = {
  response?: string;
  result?: string;
  "cf-aig-cache-status"?: string;
};

function extractResponseText(out: unknown): string {
  const result = out as AiRunResult;
  return result.response ?? result.result ?? "";
}

function extractCacheStatus(out: unknown, skipCache: boolean): GatewayMetadata["cacheStatus"] {
  if (skipCache) return "BYPASS";

  const headerStatus = (out as AiRunResult)["cf-aig-cache-status"];
  if (headerStatus === "HIT" || headerStatus === "MISS") {
    return headerStatus;
  }

  return "UNKNOWN";
}

async function runThroughGateway(
  env: Env,
  prompt: string,
  skipCache: boolean
): Promise<{ text: string; gateway: GatewayMetadata }> {
  const startedAt = performance.now();
  const options: AiGatewayRunOptions = {
    gateway: {
      id: GATEWAY_ID,
      skipCache,
    },
  };

  const out = await env.AI.run(DEFAULT_MODEL, { prompt }, options);
  const latencyMs = Math.round(performance.now() - startedAt);

  return {
    text: extractResponseText(out),
    gateway: {
      id: GATEWAY_ID,
      model: DEFAULT_MODEL,
      latencyMs,
      cacheStatus: extractCacheStatus(out, skipCache),
      skipCache,
    },
  };
}

export async function generateWithGateway(
  env: Env,
  prompt: string,
  compareCache: boolean
): Promise<GenerateResponse> {
  if (!compareCache) {
    const result = await runThroughGateway(env, prompt, false);
    return {
      response: result.text,
      gateway: result.gateway,
    };
  }

  const cached = await runThroughGateway(env, prompt, false);
  const uncached = await runThroughGateway(env, prompt, true);

  const cacheComparison: CacheComparison = {
    cached: {
      latencyMs: cached.gateway.latencyMs,
      cacheStatus: cached.gateway.cacheStatus,
      skipCache: false,
    },
    skipCache: {
      latencyMs: uncached.gateway.latencyMs,
      cacheStatus: "BYPASS",
      skipCache: true,
    },
    latencyDeltaMs: uncached.gateway.latencyMs - cached.gateway.latencyMs,
  };

  return {
    response: cached.text,
    gateway: cached.gateway,
    cacheComparison,
  };
}
