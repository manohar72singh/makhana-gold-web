"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function approveCommentAction(commentId: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const comment = await prisma.blogComment.update({
    where: { id: commentId },
    data: { isApproved: true },
    select: { blogPost: { select: { slug: true } } },
  });

  revalidatePath(`/blog/${comment.blogPost.slug}`);
  revalidatePath("/admin/blogs/comments");
}

export async function rejectCommentAction(commentId: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.blogComment.update({
    where: { id: commentId },
    data: { isApproved: false },
  });

  revalidatePath("/admin/blogs/comments");
}

export async function deleteCommentAction(commentId: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const comment = await prisma.blogComment.findUnique({
    where: { id: commentId },
    select: { blogPost: { select: { slug: true } } },
  });

  await prisma.blogComment.delete({ where: { id: commentId } });

  if (comment) revalidatePath(`/blog/${comment.blogPost.slug}`);
  revalidatePath("/admin/blogs/comments");
}
