import fs from "node:fs";
import path from "node:path";

const DOCS_DIR = path.join(import.meta.dirname, "../content/docs");

function wrapStandaloneAccordions(content) {
  return content.replace(/((?:^[ \t]*<Accordion[\s\S]*?<\/Accordion>\s*)+)/gm, (group) => {
    if (group.trimStart().startsWith("<Accordions>")) return group;
    return `<Accordions>\n${group.trimEnd()}\n</Accordions>\n`;
  });
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".mdx")) {
      const raw = fs.readFileSync(full, "utf8");
      if (!raw.includes("<Accordion ")) continue;
      const next = wrapStandaloneAccordions(raw);
      if (next !== raw) {
        fs.writeFileSync(full, next);
        console.log(`Wrapped accordions in ${path.relative(DOCS_DIR, full)}`);
      }
    }
  }
}

walk(DOCS_DIR);
console.log("Done fixing accordions.");
