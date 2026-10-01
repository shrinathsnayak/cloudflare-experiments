import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Code2, Rocket, Terminal } from "lucide-react";
import { readExperimentExample, type ExampleSnippet } from "@/lib/experiment-example";
import { experimentDeployUrl, experimentSourceUrl } from "@/lib/shared";

function Snippet({ snippet, title }: { snippet: ExampleSnippet; title: string }) {
  return (
    <DynamicCodeBlock
      lang={snippet.lang}
      code={snippet.code}
      codeblock={{
        title,
        allowCopy: true,
        className: "my-0",
        viewportProps: { className: "max-h-64" },
      }}
    />
  );
}

/** Above-the-fold request, sample response, and Deploy button for an experiment page. */
export function ExperimentTryBlock({ slug }: { slug: string }) {
  const example = readExperimentExample(slug);
  const request = example?.request ?? null;
  const response = example?.response ?? null;

  return (
    <section
      aria-label="Try this experiment"
      className="not-prose rounded-xl border border-fd-border bg-fd-card/40 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Try it</h2>
        <div className="flex flex-wrap items-center gap-2">
          {example?.hasLocalDevelopment ? (
            <a
              href="#local-development"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
            >
              <Terminal className="size-3.5" />
              Run locally
            </a>
          ) : null}
          <a
            href={experimentSourceUrl(slug)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-fd-accent"
          >
            <Code2 className="size-3.5" />
            Source
          </a>
          <a
            href={example?.deployUrl ?? experimentDeployUrl(slug)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Rocket className="size-3.5" />
            Deploy to Cloudflare
          </a>
        </div>
      </div>
      {request ? (
        <div className={`mt-3 grid gap-3 ${response ? "lg:grid-cols-2" : ""}`}>
          <Snippet snippet={request} title="Request" />
          {response ? <Snippet snippet={response} title="Sample response" /> : null}
        </div>
      ) : null}
    </section>
  );
}
