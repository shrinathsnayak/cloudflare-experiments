import { Google_Sans, Google_Sans_Code } from "next/font/google";

export const uiFont = Google_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["system-ui", "Segoe UI", "Roboto", "sans-serif"],
});

/** Monospace companion to Google Sans - code blocks, inline code, file trees. */
const codeFont = Google_Sans_Code({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-code",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
});

export const fontVariables = `${uiFont.variable} ${codeFont.variable}`;
