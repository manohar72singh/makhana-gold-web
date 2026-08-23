import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BlogEditorStudio } from "@/components/admin/BlogEditorStudio";
import { updateBlogPostAction } from "../actions";

export default async function AdminEditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  if (isNaN(id)) notFound();

  const blog = await prisma.blogPost.findUnique({
    where: { id },
  });

  if (!blog) notFound();

  const initialData = {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt || "",
    content: blog.content,
    coverImage: blog.coverImage || "/images/vibrant/hero.jpg",
    category: blog.category,
    tags: blog.tags || "",
    authorName: blog.authorName,
    authorRole: blog.authorRole,
    isPublished: blog.isPublished,
    featured: blog.featured,
    metaTitle: blog.metaTitle || "",
    metaDescription: blog.metaDescription || "",
    metaKeywords: blog.metaKeywords || "",
    canonicalUrl: blog.canonicalUrl || "",
  };

  const boundUpdateAction = updateBlogPostAction.bind(null, blog.id);

  return <BlogEditorStudio initialData={initialData} onSubmitAction={boundUpdateAction} />;
}
