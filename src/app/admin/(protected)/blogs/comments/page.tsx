import Link from "next/link";
import { prisma } from "@/lib/db";
import { approveCommentAction, rejectCommentAction, deleteCommentAction } from "../comment-actions";

export default async function AdminBlogCommentsPage() {
  let pendingComments: {
    id: number;
    blogPostId: number;
    authorName: string;
    authorEmail: string;
    body: string;
    isApproved: boolean;
    createdAt: Date;
    blogPost: { title: string; slug: string };
  }[] = [];
  let approvedComments: typeof pendingComments = [];

  try {
    const all = await (prisma as any).blogComment.findMany({
      include: { blogPost: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    pendingComments = all.filter((c: { isApproved: boolean }) => !c.isApproved);
    approvedComments = all.filter((c: { isApproved: boolean }) => c.isApproved);
  } catch {
    // Table not yet migrated
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <Link href="/admin/blogs" className="text-sm text-blue-600 hover:underline mb-1 block">
            ← Back to Blogs
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Blog Comment Moderation
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Review and approve reader comments before they appear publicly.
          </p>
        </div>
        <div className="flex gap-3">
          <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1.5 rounded-full">
            {pendingComments.length} Pending
          </span>
          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full">
            {approvedComments.length} Approved
          </span>
        </div>
      </div>

      {/* Pending Comments */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          Pending Moderation ({pendingComments.length})
        </h2>

        {pendingComments.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <p className="text-green-800 font-semibold text-sm">All caught up! No pending comments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingComments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{comment.authorName}</p>
                    <p className="text-xs text-gray-500">{comment.authorEmail}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      On:{" "}
                      <Link href={`/blog/${comment.blogPost.slug}`} className="text-blue-600 hover:underline">
                        {comment.blogPost.title}
                      </Link>
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {new Date(comment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>

                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mb-4 leading-relaxed">
                  {comment.body}
                </p>

                <div className="flex gap-2">
                  <form action={approveCommentAction.bind(null, comment.id)}>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={deleteCommentAction.bind(null, comment.id)}>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved Comments */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
          Approved Comments ({approvedComments.length})
        </h2>

        {approvedComments.length === 0 ? (
          <p className="text-sm text-gray-500">No approved comments yet.</p>
        ) : (
          <div className="space-y-3">
            {approvedComments.map((comment) => (
              <div key={comment.id} className="bg-green-50 rounded-xl border border-green-100 p-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-xs text-gray-900">{comment.authorName}</p>
                    <span className="text-[10px] text-gray-400">
                      • {new Date(comment.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{comment.body}</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    on: <span className="font-medium text-gray-600">{comment.blogPost.title}</span>
                  </p>
                </div>
                <form action={deleteCommentAction.bind(null, comment.id)}>
                  <button
                    type="submit"
                    title="Delete this comment"
                    className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-[11px] font-bold rounded-lg hover:bg-red-50 transition-colors shrink-0"
                  >
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
