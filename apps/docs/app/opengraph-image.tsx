import { OgImage, getOgImageOptions } from "@/lib/og";
import { getExperimentCount } from "@/lib/catalog.server";
import { getLogoDataUrl } from "@/lib/logo.server";
import { appName, heroTitle, siteDescription } from "@/lib/shared";
import { ImageResponse } from "next/og";

export const alt = appName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const rootDescription = siteDescription(getExperimentCount());
/** Workers forbid fetch() in global scope - start the font load on first request. */
let rootOgOptions: ReturnType<typeof getOgImageOptions> | undefined;

export default async function Image() {
  const logoSrc = getLogoDataUrl();
  rootOgOptions ??= getOgImageOptions(heroTitle, rootDescription, appName).catch((err) => {
    rootOgOptions = undefined;
    throw err;
  });

  return new ImageResponse(
    <OgImage title={heroTitle} description={rootDescription} site={appName} logoSrc={logoSrc} />,
    await rootOgOptions
  );
}
