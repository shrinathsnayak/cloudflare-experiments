import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

export const { GET } = createFromSource(source, {
  language: "english",
  buildIndex(page) {
    const tags = [
      ...(page.data.tags ?? []),
      ...(page.data.bindings ?? []).map((binding) => binding.toLowerCase()),
    ];

    return {
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
      tag: tags.length > 0 ? tags : undefined,
    };
  },
});
