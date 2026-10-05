import Image from "next/image";
import type { BlogCover } from "@/lib/blog-covers";
import { withUnsplashUtm } from "@/lib/blog-covers";

/** Cover image with Unsplash photographer + Unsplash backlinks (utm referral). */
export function BlogCoverImage({
  cover,
  priority,
  className,
}: {
  cover: BlogCover;
  priority?: boolean;
  className?: string;
}) {
  const photoHref = withUnsplashUtm(cover.unsplashUrl);
  const photographerHref = withUnsplashUtm(cover.photographerUrl);
  const unsplashHref = withUnsplashUtm("https://unsplash.com");

  return (
    <figure className={className}>
      <a
        href={photoHref}
        target="_blank"
        rel="noreferrer noopener"
        className="relative block aspect-[16/9] overflow-hidden rounded-lg"
      >
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority={priority}
          // Hotlink Unsplash CDN (photographer view attribution) and avoid
          // depending on /_next/image on the Workers runtime.
          unoptimized
        />
      </a>
      <figcaption className="mt-2 text-xs text-fd-muted-foreground">
        Photo by{" "}
        <a
          href={photographerHref}
          target="_blank"
          rel="noreferrer noopener"
          className="underline-offset-2 hover:text-brand hover:underline"
        >
          {cover.photographer}
        </a>{" "}
        on{" "}
        <a
          href={unsplashHref}
          target="_blank"
          rel="noreferrer noopener"
          className="underline-offset-2 hover:text-brand hover:underline"
        >
          Unsplash
        </a>
      </figcaption>
    </figure>
  );
}
