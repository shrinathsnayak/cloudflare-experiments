import { readExperimentSource, type ExperimentSourceFile } from "./experiment-source";

type EstreeNode = { type: string; [key: string]: unknown };

type JsxAttribute = {
  type: string;
  name?: string;
  value?: string | { type: string; value: string; data?: { estree?: EstreeNode } } | null;
};

type MdastNode = {
  type: string;
  name?: string | null;
  attributes?: JsxAttribute[];
  children?: MdastNode[];
};

const COMPONENT = "UseInYourProject";

function stringAttr(node: MdastNode, name: string): string | undefined {
  const attr = node.attributes?.find((a) => a.type === "mdxJsxAttribute" && a.name === name);
  return typeof attr?.value === "string" ? attr.value : undefined;
}

/** Read a `files={["a", "b"]}` attribute from its estree (string literals only). */
function stringArrayAttr(node: MdastNode, name: string): string[] | undefined {
  const attr = node.attributes?.find((a) => a.type === "mdxJsxAttribute" && a.name === name);
  if (!attr?.value || typeof attr.value === "string") return undefined;

  const program = attr.value.data?.estree as { body?: EstreeNode[] } | undefined;
  const expression = program?.body?.[0]?.expression as
    | { type: string; elements?: Array<EstreeNode | null> }
    | undefined;
  if (expression?.type !== "ArrayExpression" || !expression.elements) return undefined;

  return expression.elements.map((el) => {
    if (el?.type !== "Literal" || typeof el.value !== "string") {
      throw new Error(`${COMPONENT}: \`${name}\` must be an array of string literals`);
    }
    return el.value;
  });
}

function literal(value: string): EstreeNode {
  return { type: "Literal", value, raw: JSON.stringify(value) };
}

function sourcesToEstree(sources: ExperimentSourceFile[]): EstreeNode {
  return {
    type: "ArrayExpression",
    elements: sources.map((file) => ({
      type: "ObjectExpression",
      properties: Object.entries(file).map(([key, value]) => ({
        type: "Property",
        kind: "init",
        method: false,
        shorthand: false,
        computed: false,
        key: { type: "Identifier", name: key },
        value: literal(value),
      })),
    })),
  };
}

function visit(node: MdastNode, fn: (node: MdastNode) => void) {
  fn(node);
  for (const child of node.children ?? []) visit(child, fn);
}

/**
 * Inline experiment source files into `<UseInYourProject>` as a `sources` prop at
 * MDX compile time, so rendering never touches the filesystem (Workers have none).
 */
export function remarkExperimentSource() {
  return (tree: MdastNode) => {
    visit(tree, (node) => {
      if (node.type !== "mdxJsxFlowElement" || node.name !== COMPONENT) return;

      const experiment = stringAttr(node, "experiment");
      const files = stringArrayAttr(node, "files");
      if (!experiment || !files?.length) {
        throw new Error(`${COMPONENT}: requires \`experiment\` and a non-empty \`files\` array`);
      }

      const sources = files.map((file) => readExperimentSource(experiment, file));
      node.attributes = (node.attributes ?? []).filter((a) => a.name !== "sources");
      node.attributes.push({
        type: "mdxJsxAttribute",
        name: "sources",
        value: {
          type: "mdxJsxAttributeValueExpression",
          value: JSON.stringify(sources),
          data: {
            estree: {
              type: "Program",
              sourceType: "module",
              body: [{ type: "ExpressionStatement", expression: sourcesToEstree(sources) }],
            },
          },
        },
      });
    });
  };
}
