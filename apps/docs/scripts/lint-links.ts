import path from "node:path";
import { fileURLToPath } from "node:url";
import { getTableOfContents } from "fumadocs-core/content/toc";
import { getSlugs } from "fumadocs-core/source";
import {
  printErrors,
  readFiles,
  scanURLs,
  type ScanResult,
  validateFiles,
} from "next-validate-link";

const docsRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDocs = path.join(docsRoot, "content/docs");
const contentBlog = path.join(docsRoot, "content/blog");

/** Top-level doc pages that redirect `/{slug}` → `/docs/{slug}` (see next.config.mjs). */
const legacyTopLevelRedirects = new Set([
  "quickstart",
  "philosophy",
  "self-hosted",
  "changelog",
  "contributing",
  "adding-experiments",
  "code-standards",
]);

function fileToDocsUrl(filePath: string): string {
  const relative = path.relative(contentDocs, filePath).replaceAll("\\", "/");
  const slugs = getSlugs(relative);
  return slugs.length === 0 ? "/docs" : `/docs/${slugs.join("/")}`;
}

function fileToBlogUrl(filePath: string): string {
  const relative = path.relative(contentBlog, filePath).replaceAll("\\", "/");
  const slugs = getSlugs(relative);
  return slugs.length === 0 ? "/blogs" : `/blogs/${slugs.join("/")}`;
}

/** Register Next.js redirect sources as valid so legacy hrefs don't fail. */
function applyRedirectAliases(scanned: ScanResult) {
  scanned.urls.set("/introduction", scanned.urls.get("/docs") ?? {});
  scanned.urls.set("/blogs", scanned.urls.get("/blogs") ?? {});

  for (const [url, meta] of [...scanned.urls]) {
    if (!url.startsWith("/docs/")) continue;
    const rest = url.slice("/docs/".length);
    const [first] = rest.split("/");

    if (
      rest.startsWith("experiments/") ||
      rest.startsWith("reference/") ||
      legacyTopLevelRedirects.has(first)
    ) {
      scanned.urls.set(`/${rest}`, meta);
    }
  }
}

async function checkLinks() {
  const docsFiles = await readFiles("content/docs/**/*.{md,mdx}", {
    pathToUrl: fileToDocsUrl,
  });
  const blogFiles = await readFiles("content/blog/**/*.{md,mdx}", {
    pathToUrl: fileToBlogUrl,
  });

  const scanned = await scanURLs({
    preset: "next",
    cwd: docsRoot,
    populate: {
      // Route group `(docs)` is included in the App Router file path.
      "(docs)/docs/[[...slug]]": docsFiles.map((file) => ({
        value: {
          slug: getSlugs(path.relative(contentDocs, file.path)),
        },
        hashes: getTableOfContents(file.content).map((item) => item.url.slice(1)),
      })),
      "(home)/blogs/page": [{}],
      "(home)/blogs/[slug]/page": blogFiles.map((file) => ({
        value: {
          slug: getSlugs(path.relative(contentBlog, file.path))[0],
        },
        hashes: getTableOfContents(file.content).map((item) => item.url.slice(1)),
      })),
    },
  });

  applyRedirectAliases(scanned);

  console.log(`collected ${scanned.urls.size} URLs, ${scanned.fallbackUrls.length} fallbacks`);

  printErrors(
    await validateFiles([...docsFiles, ...blogFiles], {
      scanned,
      markdown: {
        components: {
          Card: { attributes: ["href"] },
        },
      },
      checkRelativePaths: "as-url",
      pathToUrl: (filePath) =>
        filePath.includes(`${path.sep}content${path.sep}blog${path.sep}`) ||
          filePath.includes("/content/blog/")
          ? fileToBlogUrl(filePath)
          : fileToDocsUrl(filePath),
    }),
    true
  );
}

void checkLinks();
