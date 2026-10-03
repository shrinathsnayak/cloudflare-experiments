"use client";

import { logoDimensions, logoNavPathPublic } from "@/lib/logo";
import { appName, docsRoute, homeRoute } from "@/lib/shared";

type ErrorFallbackProps = {
  error: Error & { digest?: string };
  /** Segment boundary recovery (re-render children). */
  onRetry?: () => void;
  /** When true, render a compact panel (keeps surrounding layout). */
  embedded?: boolean;
};

function recover(onRetry?: () => void) {
  if (onRetry) {
    onRetry();
    return;
  }
  window.location.reload();
}

export function ErrorFallback({ error, onRetry, embedded = false }: ErrorFallbackProps) {
  const digest = error.digest;
  const isServerError = Boolean(digest);

  return (
    <div
      className={
        embedded
          ? "relative flex flex-1 flex-col items-center justify-center px-6 py-20"
          : "relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16"
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(243_128_32_/_0.16),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgb(243_128_32_/_0.08),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,var(--color-fd-background)_85%)] dark:bg-[linear-gradient(to_bottom,transparent,#0a0a0a_85%)]"
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <a
          href={homeRoute}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-fd-foreground transition-opacity hover:opacity-80"
        >
          <img
            src={logoNavPathPublic}
            alt=""
            width={logoDimensions.nav.width}
            height={logoDimensions.nav.height}
            className="size-7 rounded-md"
          />
          {appName}
        </a>

        <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-brand/30 bg-brand/10 text-brand">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="size-6"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            />
          </svg>
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
          Something went wrong
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-balance text-fd-foreground md:text-3xl">
          This page couldn&apos;t load
        </h1>
        <p className="mt-3 text-sm text-pretty text-zinc-600 dark:text-white/70">
          {isServerError
            ? "A server error occurred. Reload to try again, or head back home."
            : "Reload to try again, or go back to a working page."}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => recover(onRetry)}
            className="inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition-opacity hover:opacity-90"
          >
            Reload
          </button>
          <a
            href={docsRoute}
            className="inline-flex items-center justify-center rounded-lg border border-fd-border bg-fd-secondary px-5 py-2.5 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
          >
            Docs home
          </a>
          <a
            href={homeRoute}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-fd-accent dark:text-white/85 dark:hover:bg-white/10"
          >
            Site home
          </a>
        </div>

        {digest ? (
          <p className="mt-8 font-mono text-[11px] tracking-wide text-zinc-500 dark:text-white/40">
            Error {digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
