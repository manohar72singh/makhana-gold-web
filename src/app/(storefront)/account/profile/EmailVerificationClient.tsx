"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestEmailOtpAction, verifyEmailOtpAction } from "./email-actions";

export function EmailVerificationClient({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<"idle" | "otp_sent" | "done">("idle");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mergedNote, setMergedNote] = useState(false);

  function sendCode() {
    setError(null);
    const formData = new FormData();
    formData.set("email", email);
    startTransition(async () => {
      const res = await requestEmailOtpAction(formData);
      if (res.success) {
        setStep("otp_sent");
      } else {
        setError(res.error || "Something went wrong. Please try again.");
      }
    });
  }

  function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    sendCode();
  }

  function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    formData.set("code", code);
    startTransition(async () => {
      const res = await verifyEmailOtpAction(formData);
      if (res.success) {
        setStep("done");
        setMergedNote(Boolean(res.merged));
        router.refresh();
        if (callbackUrl) {
          setTimeout(() => router.push(callbackUrl), 1800);
        }
      } else {
        setError(res.error || "Something went wrong. Please try again.");
      }
    });
  }

  if (step === "done") {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
        <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">check_circle</span>
        <div>
          <p className="text-sm font-bold text-emerald-800">Email verified!</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            {mergedNote
              ? "We found an existing account with this email and merged your orders, addresses and cart into this account."
              : "Your account is now linked to this email — logging in with it or your phone number will always bring up this same account."}
          </p>
          {callbackUrl && (
            <p className="text-xs text-emerald-700 mt-1.5">Redirecting you back to checkout…</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {callbackUrl && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] shrink-0">info</span>
          <span>Please verify a real email address to continue to checkout — this keeps your order history and account in one place.</span>
        </div>
      )}

      {step === "idle" && (
        <form onSubmit={handleSendCode} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 bg-[#FAF6EE] rounded-2xl border border-amber-900/15 px-4 py-3 text-sm text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
          <button
            type="submit"
            disabled={pending}
            className="bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white px-5 py-3 rounded-2xl font-label-md text-xs uppercase tracking-wider font-bold cursor-pointer disabled:opacity-60 whitespace-nowrap inline-flex items-center justify-center gap-1.5"
          >
            <span className={pending ? "material-symbols-outlined text-[16px] animate-spin" : "hidden"}>
              progress_activity
            </span>
            <span>{pending ? "Sending…" : "Send Code"}</span>
          </button>
        </form>
      )}

      {step === "otp_sent" && (
        <form onSubmit={handleVerifyCode} className="space-y-2.5">
          <p className="text-xs text-on-surface-variant">
            We sent a 6-digit code to <span className="font-bold text-on-surface">{email}</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              inputMode="numeric"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Enter 6-digit code"
              className="flex-1 bg-[#FAF6EE] rounded-2xl border border-amber-900/15 px-4 py-3 text-sm text-[#1C150C] tracking-[0.3em] font-mono focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            <button
              type="submit"
              disabled={pending}
              className="bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white px-5 py-3 rounded-2xl font-label-md text-xs uppercase tracking-wider font-bold cursor-pointer disabled:opacity-60 whitespace-nowrap inline-flex items-center justify-center gap-1.5"
            >
              <span className={pending ? "material-symbols-outlined text-[16px] animate-spin" : "hidden"}>
                progress_activity
              </span>
              <span>{pending ? "Verifying…" : "Verify"}</span>
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => {
                setStep("idle");
                setCode("");
                setError(null);
              }}
              className="text-amber-800 font-bold hover:underline cursor-pointer"
            >
              Change email
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={sendCode}
              className="text-amber-800 font-bold hover:underline cursor-pointer disabled:opacity-60"
            >
              Resend code
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
