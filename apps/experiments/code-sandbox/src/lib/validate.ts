import { MAX_CODE_LENGTH, SUPPORTED_LANGUAGE } from "../constants/defaults";
import type { ExecLanguage } from "../types/exec";

export function validateLanguage(input: string | undefined): ExecLanguage | null {
  if (input !== SUPPORTED_LANGUAGE) return null;
  return input;
}

export function validateCode(input: string | undefined): string | null {
  if (typeof input !== "string") return null;
  if (!input.trim() || input.length > MAX_CODE_LENGTH) return null;
  return input;
}
