import { logoDataUrl } from "@/lib/generated/logo-data";

/** Base64 data URL for OG image generation (server-only). */
export function getLogoDataUrl(): string {
  return logoDataUrl;
}
