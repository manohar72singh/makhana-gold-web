"use client";

import { useState, useTransition } from "react";
import { subscribeNewsletterAction } from "@/app/(storefront)/newsletter-actions";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    startTransition(async () => {
      await subscribeNewsletterAction(email);
      setSubscribed(true);
      setEmail("");
    });
  }

  if (subscribed) {
    return (
      <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 rounded-2xl p-3.5 text-xs flex items-center gap-2.5 shadow-sm animate-fadeIn">
        <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
        <div>
          <span className="font-bold block">Welcome to The Gold Standard Society!</span>
          <span className="text-[11px] text-emerald-300/80">We've sent your 15% VIP welcome code to your inbox.</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col xs:flex-row gap-2 mt-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email for 15% off"
        disabled={pending}
        className="bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-amber-100/50 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 flex-1 disabled:opacity-50 min-w-0"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white px-4 py-2.5 rounded-xl font-label-md text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow-xs font-bold disabled:opacity-50 w-full xs:w-auto"
      >
        {pending ? "Joining..." : "Join"}
      </button>
    </form>
  );
}
