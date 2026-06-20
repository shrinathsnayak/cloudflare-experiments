import { pageSchema } from "fumadocs-core/source/schema";
import { z } from "zod";

export const docsPageSchema = pageSchema.extend({
  tags: z.array(z.string()).optional(),
  bindings: z.array(z.string()).optional(),
});
