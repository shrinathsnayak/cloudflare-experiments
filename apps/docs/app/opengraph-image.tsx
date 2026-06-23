import { OgImage, getOgImageOptions } from "@/lib/og";
import { getLogoDataUrl } from "@/lib/logo.server";
import { appDescription, appName, heroTitle } from "@/lib/shared";
import { ImageResponse } from "next/og";

export const alt = appName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const rootOgOptions = getOgImageOptions(heroTitle, appDescription, appName);

export default async function Image() {
  const logoSrc = getLogoDataUrl();

  return new ImageResponse(
    <OgImage title={heroTitle} description={appDescription} site={appName} logoSrc={logoSrc} />,
    await rootOgOptions
  );
}
