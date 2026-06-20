import { readFileSync } from "node:fs";
import { join } from "node:path";

const logoPath = join(process.cwd(), "public/logo.png");

export function getLogoDataUrl(): string {
  const data = readFileSync(logoPath);
  return `data:image/png;base64,${data.toString("base64")}`;
}

/** Official Cloudflare cloud mark (512×232). */
export const logoPathPublic = "/logo.png";

/** Width/height for layout; preserves the logo's ~2.2:1 aspect ratio. */
export const logoDimensions = {
  og: { width: 80, height: 36 },
  nav: { width: 28, height: 13 },
} as const;
