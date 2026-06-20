import { CODE_CHARS, CODE_LENGTH } from "../constants/defaults";

/** Generate a random short code (alphanumeric, URL-safe). */
export function generateCode(): string {
  let code = "";
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[bytes[i]! % CODE_CHARS.length];
  }
  return code;
}
