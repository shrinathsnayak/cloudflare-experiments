import { OgImage, getOgImageOptions } from "@/lib/og";
import { getLogoDataUrl } from "@/lib/logo.server";
import { getPageImage, source } from "@/lib/source";
import { appName } from "@/lib/shared";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";

export async function GET(_req: Request, { params }: RouteContext<"/og/[...slug]">) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  const title = page.data.title;
  const description = page.data.description;
  const logoSrc = getLogoDataUrl();

  return new ImageResponse(
    <OgImage title={title} description={description} site={appName} logoSrc={logoSrc} />,
    await getOgImageOptions(title, description, appName)
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImage(page).segments,
  }));
}
