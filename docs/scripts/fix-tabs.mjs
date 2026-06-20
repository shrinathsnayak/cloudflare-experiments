import fs from "node:fs";
import path from "node:path";

const DOCS_DIR = path.join(import.meta.dirname, "../content/docs");

function convertTabs(content) {
  return content.replace(/<Tabs>\s*([\s\S]*?)<\/Tabs>/g, (_, inner) => {
    const titles = [...inner.matchAll(/<Tab title="([^"]+)"/g)].map((m) => m[1]);
    let converted = inner.replace(/<Tab title="([^"]+)"/g, '<Tab value="$1"');
    const itemsAttr = titles.length > 0 ? ` items={${JSON.stringify(titles)}}` : "";
    return `<Tabs${itemsAttr}>\n${converted}\n</Tabs>`;
  });
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".mdx")) {
      const raw = fs.readFileSync(full, "utf8");
      const next = convertTabs(raw);
      if (next !== raw) {
        fs.writeFileSync(full, next);
        console.log(`Fixed tabs in ${path.relative(DOCS_DIR, full)}`);
      }
    }
  }
}

walk(DOCS_DIR);
console.log("Done fixing tabs.");
