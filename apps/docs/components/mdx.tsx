import defaultMdxComponents from "fumadocs-ui/mdx";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import {
  Callout,
  CalloutContainer,
  CalloutDescription,
  CalloutTitle,
} from "fumadocs-ui/components/callout";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import { GithubInfo } from "fumadocs-ui/components/github-info";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import { cn } from "@/lib/cn";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

function isExternalSrc(src: ComponentProps<"img">["src"]): src is string {
  return typeof src === "string" && /^https?:\/\//.test(src);
}

function isDeployButtonSrc(src: ComponentProps<"img">["src"]): boolean {
  return typeof src === "string" && src.includes("deploy.workers.cloudflare.com/button");
}

/** Remote SVGs (e.g. deploy buttons) cannot go through next/image and return 400. */
function MdxImage(props: ComponentProps<"img">) {
  if (isExternalSrc(props.src)) {
    return (
      <img
        {...props}
        alt={props.alt ?? ""}
        className={cn(!isDeployButtonSrc(props.src) && "rounded-lg", props.className)}
      />
    );
  }

  const DefaultImage = defaultMdxComponents.img;
  const image = <DefaultImage {...props} />;

  return (
    <ImageZoom>
      <span className="inline-block">{image}</span>
    </ImageZoom>
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Accordion,
    Accordions,
    Callout,
    CalloutContainer,
    CalloutDescription,
    CalloutTitle,
    File,
    Files,
    Folder,
    GithubInfo,
    Step,
    Steps,
    Tab,
    Tabs,
    TypeTable,
    img: MdxImage,
    ...components,
  } satisfies MDXComponents;
}

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
