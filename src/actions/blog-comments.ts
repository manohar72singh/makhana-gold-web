"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitBlogCommentAction(formData: FormData) {
  const blogPostId = Number(formData.get("blogPostId"));
  const parentId = formData.get("parentId") ? Number(formData.get("parentId")) : null;
  const authorName = (formData.get("authorName") as string)?.trim();
  const authorEmail = (formData.get("authorEmail") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();

  // Honeypot spam check — if "website" field is filled, it's a bot
  const honeypot = (formData.get("website") as string)?.trim();
  if (honeypot) return; // Silently reject bots

  if (!blogPostId || !authorName || !authorEmail || !body) return;
  if (body.length < 10 || body.length > 2000) return;
  if (authorName.length < 2 || authorName.length > 100) return;

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) return;

  // Verify blog post exists
  const blog = await prisma.blogPost.findUnique({
    where: { id: blogPostId, isPublished: true },
    select: { id: true, slug: true },
  });
  if (!blog) return;

  await prisma.blogComment.create({
    data: {
      blogPostId,
      parentId,
      authorName,
      authorEmail,
      body,
      isApproved: false, // All comments start as pending moderation
    },
  });

  revalidatePath(`/blog/${blog.slug}`);
}
