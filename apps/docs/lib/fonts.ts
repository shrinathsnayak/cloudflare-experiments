import { Inter, JetBrains_Mono } from "next/font/google";

/** Navigation, sidebar, page titles, and other UI chrome. */
export const uiFont = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

/** Article body, code blocks, inline code, and terminal output. */
export const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const fontVariables = `${uiFont.variable} ${monoFont.variable}`;
