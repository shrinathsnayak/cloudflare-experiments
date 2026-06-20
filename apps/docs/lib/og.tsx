import type { ReactNode } from "react";
import type { ImageResponse } from "next/og";
import { logoDimensions } from "@/lib/logo";

export const ogPrimary = "#f38020";

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
        <img
          src={logoSrc}
          width={logoDimensions.og.width}
          height={logoDimensions.og.height}
          alt=""
        />
        <p
          style={{
            fontFamily: "Inter",
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
          fontFamily: "Inter",
          fontSize: "72px",
          fontWeight: 800,
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
            fontFamily: "JetBrains Mono",
            fontSize: "32px",
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

async function loadGoogleFont(font: string, weight: number, text: string) {
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

  return response.arrayBuffer();
}

function collectText(...parts: Array<ReactNode | undefined>) {
  return [...new Set(parts.filter(Boolean).join(""))].join("");
}

type OgImageOptions = ConstructorParameters<typeof ImageResponse>[1];

export async function getOgImageOptions(
  ...parts: Array<ReactNode | undefined>
): Promise<OgImageOptions> {
  const text = collectText(...parts);

  const [interSemi, interBold, jetbrains] = await Promise.all([
    loadGoogleFont("Inter", 600, text),
    loadGoogleFont("Inter", 800, text),
    loadGoogleFont("JetBrains Mono", 400, text),
  ]);

  return {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Inter", data: interSemi, weight: 600, style: "normal" as const },
      { name: "Inter", data: interBold, weight: 800, style: "normal" as const },
      { name: "JetBrains Mono", data: jetbrains, weight: 400, style: "normal" as const },
    ],
  };
}
