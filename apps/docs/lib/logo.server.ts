import { readFileSync } from "node:fs";
import { join } from "node:path";
import { logoPathPublic } from "@/lib/logo";

const logoPath = join(process.cwd(), "public", logoPathPublic.slice(1));
const logoDataUrl = `data:image/png;base64,${readFileSync(logoPath).toString("base64")}`;

/** Base64 data URL for OG image generation (server-only). */
export function getLogoDataUrl(): string {
  return logoDataUrl;
}
