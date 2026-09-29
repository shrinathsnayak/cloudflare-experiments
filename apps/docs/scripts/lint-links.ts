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

/** Register Next.js redirect sources as valid so legacy hrefs don't fail. */
function applyRedirectAliases(scanned: ScanResult) {
  scanned.urls.set("/introduction", scanned.urls.get("/docs") ?? {});

  for (const [url, meta] of [...scanned.urls]) {
    if (!url.startsWith("/docs/")) continue;
    const rest = url.slice("/docs/".length);
    const [first] = rest.split("/");

    if (rest.startsWith("experiments/") || rest.startsWith("reference/") || legacyTopLevelRedirects.has(first)) {
      scanned.urls.set(`/${rest}`, meta);
    }
  }
}

async function checkLinks() {
  const docsFiles = await readFiles("content/docs/**/*.{md,mdx}", {
    pathToUrl: fileToDocsUrl,
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
    },
  });

  applyRedirectAliases(scanned);

  console.log(`collected ${scanned.urls.size} URLs, ${scanned.fallbackUrls.length} fallbacks`);

  printErrors(
    await validateFiles(docsFiles, {
      scanned,
      markdown: {
        components: {
          Card: { attributes: ["href"] },
        },
      },
      checkRelativePaths: "as-url",
      pathToUrl: fileToDocsUrl,
    }),
    true
  );
}

void checkLinks();
