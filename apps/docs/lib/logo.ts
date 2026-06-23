/** Square app mark (864×864). */
export const logoPathPublic = "/logo.png";

/** Nav-sized derivative (56×56, 2× display size for retina). */
export const logoNavPathPublic = "/logo-nav.png";

/** Width/height for layout; square 1:1 mark. */
export const logoDimensions = {
  og: { width: 72, height: 72 },
  nav: { width: 28, height: 28 },
} as const;

/** Favicon and PWA icon paths (served from public/). */
export const siteIcons = {
  favicon16: "/favicon-16.png",
  favicon32: "/favicon-32.png",
  favicon48: "/favicon-48.png",
  favicon64: "/favicon-64.png",
  favicon128: "/favicon-128.png",
  favicon192: "/favicon-192.png",
  favicon256: "/favicon-256.png",
  appleTouch: "/apple-touch-icon.png",
} as const;
