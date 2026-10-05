import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { metaSchema } from "fumadocs-core/source/schema";
import lastModified from "fumadocs-mdx/plugins/last-modified";
import { blogPageSchema, docsPageSchema } from "./lib/page-schema";
import { remarkExperimentSource } from "./lib/remark-experiment-source";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: docsPageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const blog = defineDocs({
  dir: "content/blog",
  docs: {
    schema: blogPageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    preset: "fumadocs",
    remarkPlugins: [remarkExperimentSource],
  },
});
