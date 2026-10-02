#!/usr/bin/env node
/**
 * Embed public/logo.png as a base64 data URL for OG image routes.
 * Workers have no filesystem, so the logo cannot be read at request time.
 *
 * Runs on postinstall; output lives in lib/generated/ (gitignored).
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const docsRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const logo = readFileSync(join(docsRoot, "public/logo.png")).toString("base64");
const outDir = join(docsRoot, "lib/generated");

mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, "logo-data.ts"),
  `export const logoDataUrl = "data:image/png;base64,${logo}";\n`
);
