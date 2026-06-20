import fs from "node:fs";
import path from "node:path";

const SOURCE_DIR = process.argv[2] ?? path.join(import.meta.dirname, "../../../tmp/docs-ref");
const TARGET_DIR = path.join(import.meta.dirname, "../content/docs");

const FILES = [
  "introduction.mdx",
  "quickstart.mdx",
  "philosophy.mdx",
  "contributing.mdx",
  "code-standards.mdx",
  "adding-experiments.mdx",
  ...fs.readdirSync(path.join(SOURCE_DIR, "experiments")).map((f) => `experiments/${f}`),
  ...fs.readdirSync(path.join(SOURCE_DIR, "reference")).map((f) => `reference/${f}`),
];

function convertLinks(content) {
  return content.replace(/(\[[^\]]+\]\()\/(?!\/)([^)]+)\)/g, (_, prefix, slug) => {
    if (slug.startsWith("http")) return `${prefix}/${slug})`;
    return `${prefix}/${slug})`;
  });
}

function convertCallouts(content) {
  return content
    .replace(/<Note>/g, "<Callout>")
    .replace(/<\/Note>/g, "</Callout>")
    .replace(/<Tip>/g, '<Callout type="info">')
    .replace(/<\/Tip>/g, "</Callout>")
    .replace(/<Info>/g, "<Callout>")
    .replace(/<\/Info>/g, "</Callout>")
    .replace(/<Warning>/g, '<Callout type="warn">')
    .replace(/<\/Warning>/g, "</Callout>");
}

function convertCards(content) {
  return content
    .replace(/<CardGroup[^>]*>/g, "<Cards>")
    .replace(/<\/CardGroup>/g, "</Cards>")
    .replace(/<Card([^>]*)\sicon="[^"]*"([^>]*)>/g, "<Card$1$2>");
}

function convertAccordions(content) {
  return content
    .replace(/<AccordionGroup>/g, "<Accordions>")
    .replace(/<\/AccordionGroup>/g, "</Accordions>")
    .replace(/<Accordion([^>]*)\sicon="[^"]*"([^>]*)>/g, "<Accordion$1$2>");
}

function convertSteps(content) {
  return content.replace(/<Step title="([^"]+)">/g, "<Step>\n\n**$1**\n\n");
}

function convertCodeGroups(content) {
  const blockRegex = /<CodeGroup>\s*([\s\S]*?)<\/CodeGroup>/g;
  return content.replace(blockRegex, (_, inner) => {
    const fences = [...inner.matchAll(/```(\w+)(?:\s+(\S+))?\n([\s\S]*?)```/g)];
    if (fences.length === 0) return inner;

    const labels = fences.map(([, lang, label]) => label ?? lang);
    const tabs = fences
      .map(([, lang, label, code], i) => {
        const value = labels[i];
        return `<Tab value="${value}">\n\`\`\`${lang}\n${code}\`\`\`\n</Tab>`;
      })
      .join("\n");

    return `<Tabs items={${JSON.stringify(labels)}}>\n${tabs}\n</Tabs>`;
  });
}

function convertTabs(content) {
  return content.replace(/<Tabs>\s*([\s\S]*?)<\/Tabs>/g, (_, inner) => {
    const titles = [...inner.matchAll(/<Tab title="([^"]+)"/g)].map((m) => m[1]);
    let converted = inner.replace(/<Tab title="([^"]+)"/g, '<Tab value="$1"');
    const itemsAttr = titles.length > 0 ? ` items={${JSON.stringify(titles)}}` : "";
    return `<Tabs${itemsAttr}>\n${converted}\n</Tabs>`;
  });
}

function convertMintlify(content) {
  let result = content;
  result = convertCallouts(result);
  result = convertCards(result);
  result = convertAccordions(result);
  result = convertSteps(result);
  result = convertCodeGroups(result);
  result = convertTabs(result);
  result = convertLinks(result);
  return result;
}

fs.mkdirSync(path.join(TARGET_DIR, "experiments"), { recursive: true });
fs.mkdirSync(path.join(TARGET_DIR, "reference"), { recursive: true });

for (const file of FILES) {
  const sourcePath = path.join(SOURCE_DIR, file);
  const targetPath = path.join(TARGET_DIR, file);
  const raw = fs.readFileSync(sourcePath, "utf8");
  fs.writeFileSync(targetPath, convertMintlify(raw));
  console.log(`Migrated ${file}`);
}

console.log(`Done. Migrated ${FILES.length} files.`);
