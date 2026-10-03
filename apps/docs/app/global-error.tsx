"use client";

import { ErrorFallback } from "@/components/error-fallback";
import { fontVariables, uiFont } from "@/lib/fonts";
import "./global.css";

export default function GlobalError({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
}) {
  return (
    <html lang="en" className={`${fontVariables} dark`} suppressHydrationWarning>
      <body
        className={`${uiFont.className} flex min-h-screen flex-col bg-fd-background text-fd-foreground antialiased`}
      >
        <ErrorFallback error={error} onRetry={retry ?? reset} />
      </body>
    </html>
  );
}
