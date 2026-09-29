import type * as PageTree from "fumadocs-core/page-tree";

/** Separators that stay flat (not collapsible experiment groups). */
const FLAT_SEPARATORS = new Set(["Contributing", "Reference"]);

function separatorLabel(name: PageTree.Separator["name"]): string {
  if (typeof name === "string") return name;
  if (typeof name === "number") return String(name);
  return "";
}

/**
 * Convert experiment category separators into collapsible folders.
 * Contributing / Reference stay as flat separators with their pages below.
 */
export function groupSeparatorsIntoFolders(tree: PageTree.Root): PageTree.Root {
  const children: PageTree.Node[] = [];
  let currentFolder: PageTree.Folder | null = null;

  const flush = () => {
    if (currentFolder) {
      children.push(currentFolder);
      currentFolder = null;
    }
  };

  for (const node of tree.children) {
    if (node.type === "separator") {
      flush();

      if (FLAT_SEPARATORS.has(separatorLabel(node.name))) {
        children.push(node);
        continue;
      }

      currentFolder = {
        type: "folder",
        name: node.name,
        children: [],
        collapsible: true,
        defaultOpen: false,
      };
      continue;
    }

    if (currentFolder) {
      currentFolder.children.push(node);
    } else {
      children.push(node);
    }
  }

  flush();

  return { ...tree, children };
}
