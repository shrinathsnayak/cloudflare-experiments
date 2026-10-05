import { pageSchema } from "fumadocs-core/source/schema";
import { z } from "zod";

export const docsPageSchema = pageSchema.extend({
  tags: z.array(z.string()).optional(),
  bindings: z.array(z.string()).optional(),
  /** Sidebar status badge, e.g. "new", "beta", "deprecated". */
  status: z.string().optional(),
});

/** Frontmatter for `content/blog/*.mdx`. */
export const blogPageSchema = pageSchema.extend({
  /** ISO date YYYY-MM-DD (Article datePublished). */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** Optional ISO date YYYY-MM-DD (Article dateModified); defaults to `date`. */
  updated: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  keywords: z.array(z.string()).default([]),
  /** Experiment folder slugs under apps/experiments/ this post promotes. */
  experiments: z.array(z.string()).min(1),
  /** Approximate reading time; omit to estimate from content later. */
  readingMinutes: z.number().int().positive().optional(),
  /** Pin toward the top of the blog index. */
  featured: z.boolean().optional(),
});
