import type { ReactNode } from "react";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import type { MDXComponents } from "mdx/types";

function ParamField({
  query,
  body,
  path,
  type,
  required,
  children,
}: {
  query?: string;
  body?: string;
  path?: string;
  type?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const name = query ?? body ?? path;
  const location = query ? "query" : body ? "body" : path ? "path" : undefined;

  return (
    <div className="my-4 rounded-lg border bg-fd-card p-4 not-prose">
      <div className="flex flex-wrap items-center gap-2 font-mono text-sm font-medium">
        <span>{name}</span>
        {location ? (
          <span className="rounded bg-fd-muted px-1.5 py-0.5 text-xs text-fd-muted-foreground">
            {location}
          </span>
        ) : null}
        {type ? <span className="text-fd-muted-foreground">{type}</span> : null}
        {required ? <span className="text-fd-error text-xs font-semibold">required</span> : null}
      </div>
      {children ? <div className="mt-2 text-sm text-fd-muted-foreground">{children}</div> : null}
    </div>
  );
}

function ResponseField({
  name,
  type,
  children,
}: {
  name: string;
  type?: string;
  children: ReactNode;
}) {
  return (
    <div className="my-4 rounded-lg border bg-fd-card p-4 not-prose">
      <div className="flex flex-wrap items-center gap-2 font-mono text-sm font-medium">
        <span>{name}</span>
        {type ? <span className="text-fd-muted-foreground">{type}</span> : null}
      </div>
      {children ? <div className="mt-2 text-sm text-fd-muted-foreground">{children}</div> : null}
    </div>
  );
}

function Expandable({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="my-3 rounded-lg border bg-fd-muted/30 p-3 not-prose">
      <summary className="cursor-pointer text-sm font-medium">{title}</summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Steps,
    Step,
    Tabs,
    Tab,
    Accordions,
    Accordion,
    ParamField,
    ResponseField,
    Expandable,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
