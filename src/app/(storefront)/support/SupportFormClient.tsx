"use client";

import { useState, useTransition } from "react";
import { submitContactInquiryAction } from "./actions";

export function SupportFormClient() {
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await submitContactInquiryAction(formData);
      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(res.error || "Failed to send message.");
      }
    });
  }

  if (submitted) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl p-8 border border-emerald-500/30 shadow-ambient text-center space-y-3 animate-fadeIn">
        <span className="material-symbols-outlined text-5xl text-emerald-600">
          mark_email_read
        </span>
        <h3 className="font-headline-sm text-xl font-bold text-on-surface">
          Inquiry Successfully Sent!
        </h3>
        <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
          We have dispatched an automated confirmation to your email. Our concierge team will review your message and revert within <strong>2 to 4 business hours</strong>.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 text-xs font-bold text-amber-800 underline cursor-pointer"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-ambient border border-outline-variant/30">
      <h2 className="font-headline-sm text-lg font-bold text-on-surface mb-2">
        Send a Message
      </h2>
      <p className="text-xs text-on-surface-variant mb-6">
        Fill in your inquiry below and our team will get back to you promptly.
      </p>

      {errorMsg && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-label-sm text-xs font-semibold text-on-surface block mb-1">
              Your Name *
            </label>
            <input
              name="name"
              required
              disabled={pending}
              placeholder="e.g. Eleanor Vance"
              className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="font-label-sm text-xs font-semibold text-on-surface block mb-1">
              Your Email *
            </label>
            <input
              name="email"
              type="email"
              required
              disabled={pending}
              placeholder="you@example.com"
              className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="font-label-sm text-xs font-semibold text-on-surface block mb-1">
            Subject *
          </label>
          <input
            name="subject"
            required
            disabled={pending}
            placeholder="Order Inquiry / Corporate Gifting / Feedback"
            className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label className="font-label-sm text-xs font-semibold text-on-surface block mb-1">
            Message *
          </label>
          <textarea
            name="message"
            rows={4}
            required
            disabled={pending}
            placeholder="Please describe how we can assist you..."
            className="w-full bg-[#FAF6EE] border border-amber-900/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none resize-none disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white px-8 py-3.5 rounded-xl font-label-md text-xs uppercase tracking-widest transition-all shadow-vermillion-glow cursor-pointer active:scale-98 font-bold disabled:opacity-50 flex items-center gap-2"
        >
          <span>{pending ? "Sending..." : "Send Message"}</span>
          <span className="material-symbols-outlined text-[16px]">send</span>
        </button>
      </form>
    </div>
  );
}
