import { blog } from "collections/server";
import { loader } from "fumadocs-core/source";
import { cache } from "react";
import { blogsRoute } from "@/lib/shared";

export const blogSource = loader({
  baseUrl: blogsRoute,
  source: blog.toFumadocsSource(),
});

export const getCachedBlogPage = cache((slug?: string[]) => blogSource.getPage(slug));

export type BlogPage = NonNullable<ReturnType<(typeof blogSource)["getPage"]>>;
