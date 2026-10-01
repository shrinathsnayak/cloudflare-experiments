import { cn } from "@/lib/cn";
import { readExperimentSource } from "@/lib/experiment-source";
import {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
} from "fumadocs-ui/components/codeblock";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import type { ReactNode } from "react";

const REPO =
  "https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments";

const linkClass = "font-medium text-fd-foreground underline underline-offset-2";

export type UseInYourProjectProps = {
  experiment: string;
  dependencies?: string[];
  bindings?: string[];
  platform?: string[];
  /** Paths under the experiment root - loaded from disk at build time */
  files: string[];
  installCommand?: string;
  className?: string;
  children?: ReactNode;
};

function meta(label: string, items: string[], empty: string) {
  return (
    <span className="inline-flex min-w-0 flex-wrap items-baseline gap-1.5 text-sm">
      <span className="shrink-0 text-fd-muted-foreground">{label}</span>
      <span className="font-mono text-[0.8125rem] text-fd-foreground">
        {items.length > 0 ? items.join(", ") : empty}
      </span>
    </span>
  );
}

/** Paste recipe: experiment source files as filename tabs. */
export async function UseInYourProject({
  experiment,
  dependencies = [],
  bindings = [],
  platform = [],
  files,
  installCommand,
  className,
  children,
}: UseInYourProjectProps) {
  if (files.length === 0) {
    throw new Error(`UseInYourProject(${experiment}): provide at least one file path`);
  }

  const tabs = files.map((f) => readExperimentSource(experiment, f));
  const install =
    installCommand ?? (dependencies.length ? `npm install ${dependencies.join(" ")}` : undefined);

  return (
    <div className={cn("not-prose my-4 space-y-4", className)}>
      <p className="text-sm text-fd-muted-foreground">
        Copy these files into an existing Worker. Prefer{" "}
        <a className={linkClass} href="#deployment">
          Deployment
        </a>{" "}
        to try the full experiment first. Source:{" "}
        <a className={linkClass} href={`${REPO}/${experiment}`} rel="noreferrer" target="_blank">
          apps/experiments/{experiment}
        </a>
        .
      </p>

      <div className="flex flex-wrap gap-x-4 gap-y-2 border-b border-fd-border pb-3">
        {meta("Dependencies", dependencies, "None")}
        {meta("Bindings", bindings, "None")}
        {meta("Platform", platform, "Workers runtime only")}
      </div>

      {install ? (
        <DynamicCodeBlock lang="bash" code={install} codeblock={{ title: "Install", allowCopy: true }} />
      ) : null}

      <CodeBlockTabs defaultValue={tabs[0].path}>
        <CodeBlockTabsList>
          {tabs.map((tab) => (
            <CodeBlockTabsTrigger key={tab.path} value={tab.path}>
              {tab.title}
            </CodeBlockTabsTrigger>
          ))}
        </CodeBlockTabsList>
        {tabs.map((tab) => (
          <CodeBlockTab key={tab.path} value={tab.path} className="mt-0 p-0">
            <DynamicCodeBlock
              lang={tab.lang}
              code={tab.code}
              codeblock={{
                allowCopy: true,
                className:
                  "my-0 rounded-t-none border-0 border-t border-fd-border bg-transparent shadow-none",
              }}
            />
          </CodeBlockTab>
        ))}
      </CodeBlockTabs>

      {children ? <div className="prose prose-neutral dark:prose-invert max-w-none">{children}</div> : null}
    </div>
  );
}
