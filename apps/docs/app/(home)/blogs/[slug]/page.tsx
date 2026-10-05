import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { BlogPostShell } from "@/components/blog-shell";
import { getMDXComponents } from "@/components/mdx";
import {
  getBlogPage,
  getBlogSlugs,
  toBlogPostMetaAsync,
} from "@/lib/blogs";
import { createBlogPostJsonLd, createBlogPostMetadata } from "@/lib/seo";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const page = getBlogPage(slug);
  if (!page) return {};
  const post = await toBlogPostMetaAsync(page);
  return createBlogPostMetadata(post);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const page = getBlogPage(slug);
  if (!page) notFound();

  const post = await toBlogPostMetaAsync(page);
  const MDX = page.data.body;

  return (
    <>
      <JsonLd data={createBlogPostJsonLd(post)} />
      <BlogPostShell post={post}>
        <MDX components={getMDXComponents()} />
      </BlogPostShell>
    </>
  );
}
