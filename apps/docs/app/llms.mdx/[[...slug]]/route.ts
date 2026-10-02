import { docsLlms, source } from "@/lib/source";
import { MARKDOWN_CACHE_CONTROL, applySecurityHeaders } from "@/lib/security-headers";
import { notFound } from "next/navigation";

export async function GET(_req: Request, { params }: RouteContext<"/llms.mdx/[[...slug]]">) {
  const { slug } = await params;
  // remove the appended "content.md", `/docs/index.md` is rewritten to the root page
  const slugs = slug?.slice(0, -1) ?? [];
  if (slugs.at(-1) === "index") slugs.pop();
  const page = source.getPage(slugs);
  if (!page) notFound();

  const headers = new Headers({
    "Content-Type": "text/markdown; charset=utf-8",
    "Cache-Control": MARKDOWN_CACHE_CONTROL,
  });
  applySecurityHeaders(headers);

  return new Response(await docsLlms.page(page), { headers });
}

export function generateStaticParams() {
  return source.generateParams().map((item) => ({
    ...item,
    slug: [...item.slug, "content.md"],
  }));
}
