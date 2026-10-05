/**
 * Unsplash cover images for blog posts (hotlinked per Unsplash guidelines).
 * Attribution: photographer profile + Unsplash, with utm_source/utm_medium.
 * @see https://help.unsplash.com/en/articles/2511315-guideline-attribution
 * @see https://help.unsplash.com/en/articles/2511271-guideline-hotlinking-images
 */

export type BlogCover = {
  /** Hotlinked images.unsplash.com URL (keep query params when resizing). */
  src: string;
  alt: string;
  photographer: string;
  /** Unsplash profile URL (without utm - added at render time). */
  photographerUrl: string;
  /** Unsplash photo page URL (without utm). */
  unsplashUrl: string;
};

const UTM = "utm_source=cloudflare_experiments&utm_medium=referral";

export function withUnsplashUtm(url: string): string {
  const join = url.includes("?") ? "&" : "?";
  return `${url}${join}${UTM}`;
}

function cover(input: {
  photoId: string;
  alt: string;
  photographer: string;
  username: string;
  photoPath: string;
}): BlogCover {
  return {
    src: `https://images.unsplash.com/${input.photoId}?auto=format&fit=crop&w=1600&q=80`,
    alt: input.alt,
    photographer: input.photographer,
    photographerUrl: `https://unsplash.com/@${input.username}`,
    unsplashUrl: `https://unsplash.com/photos/${input.photoPath}`,
  };
}

/** Covers keyed by blog MDX slug (filename without .mdx). */
export const blogCovers: Record<string, BlogCover> = {
  "screenshot-any-url-at-the-edge": cover({
    photoId: "photo-1498050108023-c5249f4df085",
    alt: "MacBook on a desk showing lines of code on the screen",
    photographer: "Christopher Gower",
    username: "cgower",
    photoPath: "a-macbook-with-lines-of-code-on-its-screen-on-a-busy-desk-m_HRfLhgABo",
  }),
  "summarize-any-webpage-with-workers-ai": cover({
    photoId: "photo-1677442136019-21780ecad995",
    alt: "Abstract generative AI letterform on a dark digital background",
    photographer: "Steve A Johnson",
    username: "steve_j",
    photoPath: "a-computer-generated-image-of-the-letter-a-ZPOoDQc8yMw",
  }),
  "check-if-a-website-is-down-from-cloudflare": cover({
    photoId: "photo-1558494949-ef010cbdcc31",
    alt: "Dense network cabling inside a data center rack",
    photographer: "Taylor Vick",
    username: "tvick",
    photoPath: "cable-network-M5tzZtFCOfs",
  }),
  "edge-geolocation-with-request-cf": cover({
    photoId: "photo-1451187580459-43490279c0fa",
    alt: "Earth at night seen from space with city lights",
    photographer: "NASA",
    username: "nasa",
    photoPath: "photo-of-outer-space-Q1p7bh3SHj8",
  }),
  "object-storage-on-cloudflare-r2": cover({
    photoId: "photo-1597852074816-d933c7d2b988",
    alt: "Rows of illuminated servers in a data center aisle",
    photographer: "Panumas Nikhomkhai",
    username: "panumasnikhom",
    photoPath: "black-server-racks-on-a-room-1597852074816-d933c7d2b988",
  }),
  "stateful-apis-with-durable-objects": cover({
    photoId: "photo-1550751827-4bd374c3f58b",
    alt: "Teal LED panel glowing in a dark technology setting",
    photographer: "Adi Goldstein",
    username: "adigold1",
    photoPath: "teal-led-panel-EUsVwEOsblE",
  }),
  "extract-website-metadata-and-open-graph-tags": cover({
    photoId: "photo-1460925895917-afdab827c52f",
    alt: "Laptop showing charts and analytics on a glass desk",
    photographer: "Carlos Muza",
    username: "kmuza",
    photoPath: "laptop-computer-on-glass-top-table-hpjSkU2UYSU",
  }),
  "background-jobs-with-cloudflare-queues": cover({
    photoId: "photo-1586528116311-ad8dd3c8310d",
    alt: "Warehouse shelving packed with stored inventory boxes",
    photographer: "CHUTTERSNAP",
    username: "chuttersnap",
    photoPath: "brown-cardboard-boxes-on-white-metal-rack-pNfeEa0koj0",
  }),
  "build-a-rag-search-api-with-vectorize": cover({
    photoId: "photo-1524995997946-a1c2e315a42f",
    alt: "Library bookshelves filled with books in warm light",
    photographer: "Alfons Morales",
    username: "alfonsmorales",
    photoPath: "books-in-black-wooden-book-shelf-YLSwjSy7stg",
  }),
  "cache-http-responses-at-the-edge": cover({
    photoId: "photo-1516321318423-f06f85e504b3",
    alt: "Person working on a laptop with notes nearby",
    photographer: "LinkedIn Sales Solutions",
    username: "linkedinsalesnavigator",
    photoPath: "person-using-laptop-computer-beside-aloe-vera-XJXWbfSo2f0",
  }),
  "build-a-link-shortener-with-d1-and-kv": cover({
    photoId: "photo-1518770660439-4636190af475",
    alt: "Macro photo of a circuit board with electronic components",
    photographer: "Alexandre Debiève",
    username: "alexkixa",
    photoPath: "macro-photography-of-black-circuit-board-FO7JIlwjOtU",
  }),
  "make-your-site-visible-to-ai-crawlers": cover({
    photoId: "photo-1485827404703-89b55fcc595e",
    alt: "White humanoid robot facing forward in a bright room",
    photographer: "Alex Knight",
    username: "agk42",
    photoPath: "white-robot-near-brown-wall-2EJCSULRwC8",
  }),
};

export function getBlogCover(slug: string): BlogCover | undefined {
  return blogCovers[slug];
}
