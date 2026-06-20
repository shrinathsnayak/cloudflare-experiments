import { OgImage, getOgImageOptions } from "@/lib/og";
import { getLogoDataUrl } from "@/lib/logo";
import { appDescription, appName } from "@/lib/shared";
import { ImageResponse } from "next/og";

export const alt = appName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoSrc = getLogoDataUrl();

  return new ImageResponse(
    <OgImage title={appName} description={appDescription} site={appName} logoSrc={logoSrc} />,
    await getOgImageOptions(appName, appDescription),
  );
}
