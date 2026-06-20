import { DEFAULT_TOP_K, MAX_TOP_K, MIN_TOP_K } from "../constants/defaults";

export function parseTopK(input: string | undefined): number | null {
  if (input === undefined || input === "") return DEFAULT_TOP_K;

  const parsed = Number.parseInt(input, 10);
  if (!Number.isFinite(parsed) || parsed < MIN_TOP_K || parsed > MAX_TOP_K) {
    return null;
  }

  return parsed;
}
