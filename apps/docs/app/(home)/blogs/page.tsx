import { JsonLd } from "@/components/json-ld";
import { BlogIndexShell } from "@/components/blog-shell";
import { getAllBlogPosts } from "@/lib/blogs";
import { createBlogIndexJsonLd, createBlogIndexMetadata } from "@/lib/seo";

export const metadata = createBlogIndexMetadata();

export default function BlogsPage() {
  const posts = getAllBlogPosts();

  return (
    <>
      <JsonLd data={createBlogIndexJsonLd()} />
      <BlogIndexShell posts={posts} />
    </>
  );
}
