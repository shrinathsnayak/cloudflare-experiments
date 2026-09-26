import { FLAG_KEY_PATTERN } from "../constants/defaults";
import type { Flagship, FlagshipEvaluationContext } from "../types/env";
import type { FlagDetailsResponse, FlagValueResponse } from "../types/flags";

export function validateFlagKey(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!FLAG_KEY_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function parseDefaultBoolean(input: string | undefined): boolean {
  if (input === undefined || input === null || input === "") return false;
  const normalized = input.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

export function buildContext(userId: string | undefined): FlagshipEvaluationContext {
  if (!userId || !userId.trim()) return {};
  return { userId: userId.trim() };
}

export async function evaluateBooleanFlag(
  flags: Flagship,
  flagKey: string,
  defaultValue: boolean,
  context: FlagshipEvaluationContext
): Promise<FlagValueResponse> {
  const value = await flags.getBooleanValue(flagKey, defaultValue, context);
  return { flagKey, value, context };
}

export async function evaluateBooleanFlagDetails(
  flags: Flagship,
  flagKey: string,
  defaultValue: boolean,
  context: FlagshipEvaluationContext
): Promise<FlagDetailsResponse> {
  const details = await flags.getBooleanDetails(flagKey, defaultValue, context);
  return { ...details, context };
}
