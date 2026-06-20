import defaultMdxComponents from "fumadocs-ui/mdx";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { cn } from "@/lib/cn";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

function isExternalSrc(src: ComponentProps<"img">["src"]): src is string {
  return typeof src === "string" && /^https?:\/\//.test(src);
}

/** Remote SVGs (e.g. deploy buttons) cannot go through next/image and return 400. */
function MdxImage(props: ComponentProps<"img">) {
  if (isExternalSrc(props.src)) {
    return <img {...props} alt={props.alt ?? ""} className={cn("rounded-lg", props.className)} />;
  }

  const DefaultImage = defaultMdxComponents.img;
  return <DefaultImage {...props} />;
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Accordion,
    Accordions,
    Step,
    Steps,
    Tab,
    Tabs,
    img: MdxImage,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
