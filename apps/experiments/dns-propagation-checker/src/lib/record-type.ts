import { ALLOWED_RECORD_TYPES } from "../constants/defaults";
import type { RecordType } from "../types/dns";

export function validateRecordType(input: string | undefined): RecordType | null {
  if (!input || typeof input !== "string") return null;
  const normalized = input.trim().toUpperCase();
  if (!normalized) return null;
  if (ALLOWED_RECORD_TYPES.includes(normalized as RecordType)) {
    return normalized as RecordType;
  }
  return null;
}
