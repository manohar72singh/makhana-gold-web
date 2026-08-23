"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function createBlogPostAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const title = (formData.get("title") as string)?.trim();
  const rawSlug = (formData.get("slug") as string)?.trim();
  const slug = rawSlug ? generateSlug(rawSlug) : generateSlug(title);
  const excerpt = (formData.get("excerpt") as string)?.trim() || null;
  const content = (formData.get("content") as string)?.trim();
  const coverImage = (formData.get("coverImage") as string)?.trim() || "/images/vibrant/hero.jpg";
  const category = (formData.get("category") as string)?.trim() || "Health & Nutrition";
  const tags = (formData.get("tags") as string)?.trim() || null;
  const authorName = (formData.get("authorName") as string)?.trim() || "Makhana Gold Nutritionist";
  const authorRole = (formData.get("authorRole") as string)?.trim() || "Holistic Wellness & Food Science";
  const isPublished = formData.get("isPublished") === "true" || formData.get("isPublished") === "on";
  const featured = formData.get("featured") === "true" || formData.get("featured") === "on";

  // SEO Fields (Auto-generated if left empty)
  const metaTitle = (formData.get("metaTitle") as string)?.trim() || `${title} | Makhana Gold`;
  const metaDescription = (formData.get("metaDescription") as string)?.trim() || excerpt || title;
  const metaKeywords = (formData.get("metaKeywords") as string)?.trim() || tags || "makhana, sattu, poha, superfood";
  const canonicalUrl = (formData.get("canonicalUrl") as string)?.trim() || `https://makhanagold.com/blog/${slug}`;

  const readingTimeMinutes = calculateReadingTime(content || "");

  await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      authorName,
      authorRole,
      readingTimeMinutes,
      isPublished,
      featured,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
    },
  });

  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  redirect("/admin/blogs");
}

export async function updateBlogPostAction(id: number, formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const title = (formData.get("title") as string)?.trim();
  const rawSlug = (formData.get("slug") as string)?.trim();
  const slug = rawSlug ? generateSlug(rawSlug) : generateSlug(title);
  const excerpt = (formData.get("excerpt") as string)?.trim() || null;
  const content = (formData.get("content") as string)?.trim();
  const coverImage = (formData.get("coverImage") as string)?.trim() || "/images/vibrant/hero.jpg";
  const category = (formData.get("category") as string)?.trim() || "Health & Nutrition";
  const tags = (formData.get("tags") as string)?.trim() || null;
  const authorName = (formData.get("authorName") as string)?.trim() || "Makhana Gold Nutritionist";
  const authorRole = (formData.get("authorRole") as string)?.trim() || "Holistic Wellness & Food Science";
  const isPublished = formData.get("isPublished") === "true" || formData.get("isPublished") === "on";
  const featured = formData.get("featured") === "true" || formData.get("featured") === "on";

  // SEO Fields
  const metaTitle = (formData.get("metaTitle") as string)?.trim() || `${title} | Makhana Gold`;
  const metaDescription = (formData.get("metaDescription") as string)?.trim() || excerpt || title;
  const metaKeywords = (formData.get("metaKeywords") as string)?.trim() || tags || "makhana, sattu, poha, superfood";
  const canonicalUrl = (formData.get("canonicalUrl") as string)?.trim() || `https://makhanagold.com/blog/${slug}`;

  const readingTimeMinutes = calculateReadingTime(content || "");

  await prisma.blogPost.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      authorName,
      authorRole,
      readingTimeMinutes,
      isPublished,
      featured,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
  redirect("/admin/blogs");
}

export async function deleteBlogPostAction(id: number) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  redirect("/admin/blogs");
}
