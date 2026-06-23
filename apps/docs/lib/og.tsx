import type { ReactNode } from "react";
import type { ImageResponse } from "next/og";
import { logoDimensions } from "@/lib/logo";

export const ogPrimary = "#f38020";

/** Satori (next/og) cannot render Google Sans; Roboto is the closest compatible match for previews. */
const ogSansFamily = "Roboto";

interface OgImageProps {
  title: ReactNode;
  description?: ReactNode;
  site: ReactNode;
  logoSrc: string;
}

export function OgImage({ title, description, site, logoSrc }: OgImageProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#0c0c0c",
        color: "#ffffff",
        padding: "72px 80px",
        borderBottom: `14px solid ${ogPrimary}`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "20px",
          marginBottom: "48px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: logoDimensions.og.width,
            height: logoDimensions.og.height,
            borderRadius: 14,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src={logoSrc}
            width={logoDimensions.og.width}
            height={logoDimensions.og.height}
            alt=""
          />
        </div>
        <p
          style={{
            fontFamily: ogSansFamily,
            fontSize: "36px",
            fontWeight: 600,
            color: ogPrimary,
            margin: 0,
          }}
        >
          {site}
        </p>
      </div>

      <p
        style={{
          fontFamily: ogSansFamily,
          fontSize: "72px",
          fontWeight: 700,
          lineHeight: 1.1,
          margin: 0,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </p>

      {description ? (
        <p
          style={{
            fontFamily: ogSansFamily,
            fontSize: "32px",
            fontWeight: 400,
            lineHeight: 1.4,
            color: "rgba(240,240,240,0.75)",
            margin: 0,
            marginTop: "28px",
            maxWidth: "920px",
          }}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

const fontCache = new Map<string, ArrayBuffer>();

async function loadGoogleFont(font: string, weight: number, text: string) {
  const cacheKey = `${font}:${weight}:${text}`;
  const cached = fontCache.get(cacheKey);
  if (cached) return cached;

  const family = font.replace(/ /g, "+");
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype|woff2)'\)/);

  if (!match?.[1]) {
    throw new Error(`Failed to load font: ${font}`);
  }

  const response = await fetch(match[1]);
  if (!response.ok) {
    throw new Error(`Failed to fetch font data: ${font}`);
  }

  const data = await response.arrayBuffer();
  fontCache.set(cacheKey, data);
  return data;
}

function collectText(...parts: Array<ReactNode | undefined>) {
  return [...new Set(parts.filter(Boolean).join(""))].join("");
}

type OgImageOptions = ConstructorParameters<typeof ImageResponse>[1];

export async function getOgImageOptions(
  ...parts: Array<ReactNode | undefined>
): Promise<OgImageOptions> {
  const text = collectText(...parts);

  const [ogSansRegular, ogSansSemi, ogSansBold] = await Promise.all([
    loadGoogleFont(ogSansFamily, 400, text),
    loadGoogleFont(ogSansFamily, 600, text),
    loadGoogleFont(ogSansFamily, 700, text),
  ]);

  return {
    width: 1200,
    height: 630,
    fonts: [
      { name: ogSansFamily, data: ogSansRegular, weight: 400, style: "normal" as const },
      { name: ogSansFamily, data: ogSansSemi, weight: 600, style: "normal" as const },
      { name: ogSansFamily, data: ogSansBold, weight: 700, style: "normal" as const },
    ],
  };
}
