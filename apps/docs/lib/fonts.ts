import { Google_Sans, Google_Sans_Code } from "next/font/google";

export const uiFont = Google_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
});

/** Monospace companion to Google Sans — code blocks, inline code, file trees. */
export const codeFont = Google_Sans_Code({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-code",
  display: "swap",
});

export const fontVariables = `${uiFont.variable} ${codeFont.variable}`;
