"use client";

import { ErrorFallback } from "@/components/error-fallback";

export default function DocsError({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
}) {
  return <ErrorFallback error={error} onRetry={retry ?? reset} embedded />;
}
