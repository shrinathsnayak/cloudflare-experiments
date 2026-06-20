import fs from "node:fs";
import path from "node:path";

const SOURCE = process.argv[2] ?? "/tmp/cloudflare-docs-ref";
const TARGET = process.argv[3] ?? path.join(process.cwd(), "content/docs");

const FILE_MAP = {
  "introduction.mdx": "index.mdx",
};

function convertLinks(content) {
  return (
    content
      // Internal links stay at site root (no /docs prefix).
      .replace(/href="\/(?!\/)([^"#?][^"]*)"/g, (_match, slug) => `href="/${slug}"`)
      .replace(/]\(\/(?!\/)([^)#?]+)\)/g, (_match, slug) => `](/${slug})`)
  );
}

function convertCallouts(content) {
  return content
    .replace(/<Note>\s*/g, "<Callout>\n\n")
    .replace(/<\/Note>/g, "\n</Callout>")
    .replace(/<Tip>\s*/g, '<Callout type="idea">\n\n')
    .replace(/<\/Tip>/g, "\n</Callout>")
    .replace(/<Warning>\s*/g, '<Callout type="warning">\n\n')
    .replace(/<\/Warning>/g, "\n</Callout>")
    .replace(/<Info>\s*/g, "<Callout>\n\n")
    .replace(/<\/Info>/g, "\n</Callout>");
}

function normalizeCallouts(content) {
  return content.replace(/<Callout([^>]*)>([^\n<][\s\S]*?)<\/Callout>/g, (_match, attrs, body) => {
    if (body.includes("\n")) return _match;
    return `<Callout${attrs}>\n\n${body.trim()}\n\n</Callout>`;
  });
}

function convertCards(content) {
  let result = content.replace(/<CardGroup[^>]*>/g, "<Cards>");
  result = result.replace(/<\/CardGroup>/g, "</Cards>");
  result = result.replace(/<Card([^>]*)\/>/g, "<Card$1></Card>");
  result = result.replace(/\sicon="[^"]*"/g, "");
  result = result.replace(/\siconType="[^"]*"/g, "");
  return result;
}

function convertAccordions(content) {
  return content
    .replace(/<AccordionGroup>/g, "<Accordions>")
    .replace(/<\/AccordionGroup>/g, "</Accordions>");
}

function convertExpandable(content) {
  return content.replace(
    /<Expandable title="([^"]+)">\s*([\s\S]*?)<\/Expandable>/g,
    (_match, title, body) => `\n<Accordion title="${title}">\n\n${body.trim()}\n\n</Accordion>\n`
  );
}

function convertSteps(content) {
  return content.replace(/<Step title="([^"]+)">/g, "<Step>\n\n### $1\n");
}

function convertParamField(content) {
  return content.replace(
    /<ParamField\s+([^>]+)>\s*([\s\S]*?)<\/ParamField>/g,
    (_match, attrs, desc) => {
      const query = attrs.match(/query="([^"]+)"/)?.[1] ?? "param";
      const type = attrs.match(/type="([^"]+)"/)?.[1] ?? "string";
      const required = attrs.includes("required") ? " (required)" : "";
      return `\n**\`${query}\`** \`${type}\`${required}\n\n${desc.trim()}\n`;
    }
  );
}

function convertResponseField(content) {
  return content.replace(
    /<ResponseField\s+([^>]+)>\s*([\s\S]*?)<\/ResponseField>/g,
    (_match, attrs, desc) => {
      const name = attrs.match(/name="([^"]+)"/)?.[1] ?? "field";
      const type = attrs.match(/type="([^"]+)"/)?.[1] ?? "string";
      const optional = attrs.includes("optional") ? " (optional)" : "";
      return `\n**\`${name}\`** \`${type}\`${optional}\n\n${desc.trim()}\n`;
    }
  );
}

function convertAllResponseFields(content) {
  let result = content;
  let previous;
  do {
    previous = result;
    result = convertResponseField(result);
  } while (result !== previous);
  return result;
}

function convertMintlifyTabs(content) {
  return content.replace(/<Tabs>\s*([\s\S]*?)<\/Tabs>/g, (_match, inner) => {
    const tabs = [...inner.matchAll(/<Tab title="([^"]+)">\s*([\s\S]*?)<\/Tab>/g)];
    if (tabs.length === 0) return _match;

    const items = tabs.map(([, title]) => title).join("', '");
    const body = tabs
      .map(([, title, tabContent]) => `<Tab value="${title}">\n\n${tabContent.trim()}\n\n</Tab>`)
      .join("\n");

    return `<Tabs items={['${items}']}>\n${body}\n</Tabs>`;
  });
}

function convertCodeGroup(content) {
  const codeGroupRegex = /<CodeGroup>\s*([\s\S]*?)<\/CodeGroup>/g;
  return content.replace(codeGroupRegex, (_match, inner) => {
    const blocks = [...inner.matchAll(/```(\w+)\s+(\w+)\n([\s\S]*?)```/g)];
    if (blocks.length === 0) return inner;

    const items = blocks.map(([, , label]) => label).join("', '");
    const tabs = blocks
      .map(
        ([, lang, label, code]) =>
          `<Tab value="${label}">\n\n\`\`\`${lang}\n${code}\`\`\`\n\n</Tab>`
      )
      .join("\n");

    return `<Tabs items={['${items}']}>\n${tabs}\n</Tabs>`;
  });
}

function wrapAccordions(content) {
  const parts = content.split(/(<Accordions>[\s\S]*?<\/Accordions>)/g);
  return parts
    .map((part) => {
      if (part.startsWith("<Accordions>")) return part;
      return part.replace(/((?:<Accordion[\s\S]*?<\/Accordion>\s*)+)/g, (block) => {
        return `<Accordions>\n${block.trim()}\n</Accordions>\n`;
      });
    })
    .join("");
}

function convertFile(relativePath) {
  const sourcePath = path.join(SOURCE, relativePath);
  const targetName = FILE_MAP[path.basename(relativePath)] ?? path.basename(relativePath);
  const targetPath = path.join(TARGET, path.dirname(relativePath), targetName);

  let content = fs.readFileSync(sourcePath, "utf8");
  content = convertCallouts(content);
  content = normalizeCallouts(content);
  content = convertCards(content);
  content = convertAccordions(content);
  content = convertExpandable(content);
  content = convertSteps(content);
  content = convertParamField(content);
  content = convertAllResponseFields(content);
  content = convertMintlifyTabs(content);
  content = convertCodeGroup(content);
  content = convertLinks(content);
  content = wrapAccordions(content);

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content);
  console.log(`migrated ${relativePath} -> ${path.relative(TARGET, targetPath)}`);
}

function walk(dir, base = "") {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const rel = path.join(base, entry.name);
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "snippets") continue;
      walk(full, rel);
    } else if (entry.name.endsWith(".mdx")) {
      convertFile(rel);
    }
  }
}

const metaPath = path.join(TARGET, "meta.json");
const metaBackup = fs.existsSync(metaPath) ? fs.readFileSync(metaPath, "utf8") : null;

for (const entry of fs.readdirSync(TARGET)) {
  if (entry === "meta.json") continue;
  const full = path.join(TARGET, entry);
  fs.rmSync(full, { recursive: true, force: true });
}

walk(SOURCE);

if (metaBackup) {
  fs.writeFileSync(metaPath, metaBackup);
}
