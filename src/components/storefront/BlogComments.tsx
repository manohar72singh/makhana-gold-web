"use client";

import { useState, useRef } from "react";
import { submitBlogCommentAction } from "@/actions/blog-comments";

interface Comment {
  id: number;
  authorName: string;
  body: string;
  createdAt: string; // ISO string — safe for client serialization
  replies: Comment[];
}

interface BlogCommentsProps {
  blogPostId: number;
  comments: Comment[];
}

function CommentCard({ comment, blogPostId, depth = 0 }: { comment: Comment; blogPostId: number; depth?: number }) {
  const [showReply, setShowReply] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [replyError, setReplyError] = useState(false);
  const replyFormRef = useRef<HTMLFormElement>(null);

  const handleReplySubmit = async (formData: FormData) => {
    setReplyLoading(true);
    setReplyError(false);
    formData.append("blogPostId", String(blogPostId));
    formData.append("parentId", String(comment.id));
    try {
      await submitBlogCommentAction(formData);
      setReplySuccess(true);
      replyFormRef.current?.reset();
      setTimeout(() => { setShowReply(false); setReplySuccess(false); }, 3000);
    } catch {
      setReplyError(true);
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className={`${depth > 0 ? "ml-8 border-l-2 border-amber-900/10 pl-5" : ""}`}>
      <div className="bg-white rounded-2xl border border-amber-900/10 p-5 mb-4 shadow-xs hover:shadow-warm-1 transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center shrink-0">
            <span className="text-amber-900 font-black text-sm">{comment.authorName.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-bold text-xs text-on-surface">{comment.authorName}</p>
            <time
              dateTime={new Date(comment.createdAt).toISOString()}
              className="text-[10px] text-on-surface-variant"
            >
              {new Date(comment.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
            </time>
          </div>
        </div>

        <p className="text-sm text-on-surface leading-relaxed mb-3">{comment.body}</p>

        {depth === 0 && (
          <button
            type="button"
            onClick={() => setShowReply((v) => !v)}
            className="text-[11px] font-bold text-[#D84315] hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">reply</span>
            Reply
          </button>
        )}
      </div>

      {showReply && (
        <form ref={replyFormRef} action={handleReplySubmit} className="mb-4 bg-[#FAF6EE] rounded-xl p-4 border border-amber-900/10">
          {replySuccess ? (
            <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Reply submitted! It will appear after moderation.
            </p>
          ) : replyError ? (
            <p className="text-xs text-red-600 font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">error</span>
              Something went wrong. Please try again.
            </p>
          ) : (
            <>
              <input
                name="authorName"
                required
                placeholder="Your name"
                className="w-full text-xs border border-amber-900/15 rounded-lg px-3 py-2 mb-2 bg-white outline-none focus:border-amber-600 transition-colors"
              />
              <input
                name="authorEmail"
                type="email"
                required
                placeholder="Email (not published)"
                className="w-full text-xs border border-amber-900/15 rounded-lg px-3 py-2 mb-2 bg-white outline-none focus:border-amber-600 transition-colors"
              />
              <textarea
                name="body"
                required
                rows={2}
                placeholder="Write your reply..."
                className="w-full text-xs border border-amber-900/15 rounded-lg px-3 py-2 mb-2 bg-white outline-none focus:border-amber-600 transition-colors resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={replyLoading}
                  className="px-4 py-1.5 bg-[#D84315] text-white text-xs font-bold rounded-lg hover:bg-[#BF360C] transition-colors disabled:opacity-60"
                >
                  {replyLoading ? "Sending..." : "Post Reply"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReply(false)}
                  className="px-4 py-1.5 bg-white text-amber-900 text-xs font-bold rounded-lg border border-amber-900/20 hover:bg-amber-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {comment.replies?.map((reply) => (
        <CommentCard key={reply.id} comment={reply} blogPostId={blogPostId} depth={depth + 1} />
      ))}
    </div>
  );
}

export function BlogComments({ blogPostId, comments }: BlogCommentsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setIsError(false);
    formData.append("blogPostId", String(blogPostId));
    try {
      await submitBlogCommentAction(formData);
      setIsSuccess(true);
      formRef.current?.reset();
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="comments"
      aria-label="Reader Comments"
      className="pt-12 border-t border-amber-900/10 mt-12"
    >
      <h5 className="font-headline-sm text-2xl font-black text-[#1C150C] mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#D84315] text-[24px]">forum</span>
        {comments.length > 0 ? `${comments.length} Reader Comment${comments.length !== 1 ? "s" : ""}` : "Be the First to Comment"}
      </h5>
      <p className="text-xs text-on-surface-variant mb-8">
        💬 Join the conversation — share your experience or ask a nutrition question. Comments are moderated before appearing.
      </p>

      {/* Existing Comments */}
      {comments.length > 0 && (
        <div className="mb-10 space-y-2">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} blogPostId={blogPostId} />
          ))}
        </div>
      )}

      {/* Comment Form */}
      <div className="bg-gradient-to-br from-[#FAF6EE] to-amber-50 rounded-3xl border border-amber-900/15 p-6 sm:p-8">
        <h6 className="font-bold text-sm text-amber-950 mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#D84315] text-[16px]">edit</span>
          Leave a Comment
        </h6>

        {isSuccess ? (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <span className="material-symbols-outlined text-emerald-600 text-[24px]">check_circle</span>
            <div>
              <p className="font-bold text-sm text-emerald-800">Comment submitted successfully!</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your comment is under review and will appear here once approved — usually within 24 hours.
              </p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-5">
            <span className="material-symbols-outlined text-red-600 text-[24px]">error</span>
            <div>
              <p className="font-bold text-sm text-red-800">Something went wrong!</p>
              <p className="text-xs text-red-700 mt-0.5">
                Could not submit your comment. Please check your connection and try again.
              </p>
            </div>
          </div>
        ) : (
          <form ref={formRef} action={handleSubmit} className="space-y-4">
            {/* Honeypot anti-spam field */}
            <input type="text" name="website" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="comment-name" className="block text-xs font-bold text-amber-900 mb-1.5">
                  Full Name <span className="text-[#D84315]">*</span>
                </label>
                <input
                  id="comment-name"
                  name="authorName"
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="e.g. Priya Sharma"
                  className="w-full text-sm border border-amber-900/15 rounded-xl px-4 py-2.5 bg-white outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-300 transition-all"
                />
              </div>
              <div>
                <label htmlFor="comment-email" className="block text-xs font-bold text-amber-900 mb-1.5">
                  Email Address <span className="text-[#D84315]">*</span>
                  <span className="ml-1 text-on-surface-variant font-normal">(not published)</span>
                </label>
                <input
                  id="comment-email"
                  name="authorEmail"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="w-full text-sm border border-amber-900/15 rounded-xl px-4 py-2.5 bg-white outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-300 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="comment-body" className="block text-xs font-bold text-amber-900 mb-1.5">
                Your Comment <span className="text-[#D84315]">*</span>
              </label>
              <textarea
                id="comment-body"
                name="body"
                required
                minLength={10}
                maxLength={2000}
                rows={5}
                placeholder="Share your experience, health journey, recipe ideas, or ask a nutrition question about makhana..."
                className="w-full text-sm border border-amber-900/15 rounded-xl px-4 py-3 bg-white outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-300 transition-all resize-y min-h-[120px]"
              />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-[10px] text-on-surface-variant">
                🔒 Your email is never shared. All comments are reviewed before publishing.
              </p>
              <button
                type="submit"
                id="submit-comment-btn"
                disabled={isLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white text-xs font-black rounded-xl transition-all shadow-vermillion-glow disabled:opacity-60 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">send</span>
                    Post Comment
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
