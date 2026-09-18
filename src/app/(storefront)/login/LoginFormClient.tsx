"use client";

import { useState, useEffect, useRef } from "react";
import { customerLoginAction, googleSignInAction, phoneOtpLoginAction } from "./actions";
import { requestPhoneOtpAction, validateOtpCodeAction } from "./otp-actions";

export function LoginFormClient({
  error,
  initialPhone,
  callbackUrl,
}: {
  error?: string;
  initialPhone?: string;
  callbackUrl: string;
}) {
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [otpStep, setOtpStep] = useState<"phone_input" | "otp_input" | "name_input">(
    initialPhone ? "otp_input" : "phone_input"
  );
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(initialPhone || "");
  const [otpValue, setOtpValue] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [hasName, setHasName] = useState(Boolean(initialPhone));
  const [isExisting, setIsExisting] = useState(Boolean(initialPhone));
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isFormValidated, setIsFormValidated] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const otpFormRef = useRef<HTMLFormElement>(null);
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first digit box when navigating to Step 2
  useEffect(() => {
    if (otpStep === "otp_input") {
      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 120);
    }
  }, [otpStep]);

  // Handle typing inside individual digit box
  function handleDigitChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    setClientError(null);
    const val = e.target.value.replace(/[^0-9]/g, "");

    // Handle mobile SMS auto-fill or multi-char paste
    if (val.length > 1) {
      const chars = val.slice(0, 6).split("");
      const nextDigits = ["", "", "", "", "", ""];
      chars.forEach((c, idx) => {
        nextDigits[idx] = c;
      });
      setOtpDigits(nextDigits);
      setOtpValue(nextDigits.join(""));
      const focusIndex = Math.min(chars.length, 5);
      digitInputRefs.current[focusIndex]?.focus();
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = val.slice(-1);
    setOtpDigits(nextDigits);
    setOtpValue(nextDigits.join(""));

    // Auto-advance to next box
    if (val && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  }

  // Handle backspace, arrows, and enter inside digit boxes
  function handleDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        e.preventDefault();
        const nextDigits = [...otpDigits];
        nextDigits[index - 1] = "";
        setOtpDigits(nextDigits);
        setOtpValue(nextDigits.join(""));
        digitInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      digitInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      digitInputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter" && otpDigits.every((d) => d !== "")) {
      e.preventDefault();
      otpFormRef.current?.requestSubmit();
    }
  }

  // Handle clipboard paste of 6-digit code
  function handleDigitPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    setClientError(null);
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;

    const nextDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      nextDigits[i] = pasted[i];
    }
    setOtpDigits(nextDigits);
    setOtpValue(nextDigits.join(""));
    const focusIndex = Math.min(pasted.length, 5);
    digitInputRefs.current[focusIndex]?.focus();
  }

  // Countdown timer for Resend OTP & rate-limiting cooldown
  useEffect(() => {
    if (timerSeconds <= 0) {
      if (clientError && (clientError.includes("wait") || clientError.includes("minute"))) {
        setClientError(null);
      }
      return;
    }
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds, clientError]);

  // Request / Resend OTP Action
  async function handleSendOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setClientError(null);
    setInfoMessage(null);
    setIsFormValidated(false);

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, "").slice(-10);
    if (cleanPhone.length < 10) {
      setClientError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await requestPhoneOtpAction(cleanPhone);
      if (res.cooldownSeconds && res.cooldownSeconds > 0) {
        setTimerSeconds(res.cooldownSeconds);
      }
      if (res.success) {
        setHasName(Boolean(res.hasName));
        setIsExisting(Boolean(res.isExisting));
        setTimerSeconds(res.cooldownSeconds || 60);
        setInfoMessage(res.message || "OTP sent successfully to your mobile.");
        setOtpStep("otp_input");
      } else {
        setClientError(res.error || "Failed to send OTP. Please try again.");
      }
    } catch {
      setClientError("Network error sending OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  }

  // Handle OTP verification step (never resets screen on wrong OTP, seamlessly redirects on valid OTP)
  async function handleVerifyStep(e: React.FormEvent<HTMLFormElement>) {
    if (isFormValidated) {
      return; // allow native server action submit and Next.js redirect
    }

    e.preventDefault();
    setClientError(null);
    setIsVerifyingOtp(true);

    try {
      // 1. Pre-validate OTP without causing a full-page reload
      const res = await validateOtpCodeAction({ phone: phoneNumber, otp: otpValue });
      if (!res.success) {
        setClientError(res.error || "Invalid OTP. Please check and try again.");
        setOtpDigits(["", "", "", "", "", ""]);
        setOtpValue("");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setIsVerifyingOtp(false);
        setTimeout(() => {
          digitInputRefs.current[0]?.focus();
        }, 60);
        return; // User stays safely on Step 2 (OTP input)!
      }

      // 2. OTP is valid!
      if (hasName) {
        // Existing user with a name -> trigger native NextAuth sign-in
        setIsFormValidated(true);
        setIsSubmitting(true);
        setTimeout(() => {
          otpFormRef.current?.requestSubmit();
        }, 30);
      } else {
        // New user without a name -> transition to Step 3
        setOtpStep("name_input");
        setIsVerifyingOtp(false);
      }
    } catch (err: any) {
      if (err?.digest?.includes("NEXT_REDIRECT")) {
        throw err;
      }
      setClientError("Verification failed. Please check your OTP.");
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpValue("");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setIsVerifyingOtp(false);
      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 60);
    }
  }

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {(clientError || error) && (
        <div className="p-3 rounded-xl bg-red-50/90 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <span className="material-symbols-outlined text-[18px] shrink-0 text-red-600">error</span>
          <span className="leading-snug">
            {clientError ||
              (error === "OtpError"
                ? "Invalid or expired OTP. Please check and try again."
                : "Invalid credentials. Please check and try again.")}
          </span>
        </div>
      )}

      {/* Info / Success Alert (shown on phone input) */}
      {infoMessage && otpStep === "phone_input" && (
        <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0 text-emerald-600">check_circle</span>
            <span>{infoMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setInfoMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Login Method Toggle Tabs (only on initial step) */}
      {otpStep === "phone_input" && (
        <div className="flex bg-[#FAF6EE] p-1 rounded-xl border border-amber-900/10">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("phone");
              setOtpStep("phone_input");
              setClientError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMethod === "phone"
                ? "bg-white text-amber-950 shadow-xs border border-amber-900/10"
                : "text-[#66553E] hover:text-amber-900"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">smartphone</span>
            <span>Mobile OTP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMethod("email");
              setClientError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMethod === "email"
                ? "bg-white text-amber-950 shadow-xs border border-amber-900/10"
                : "text-[#66553E] hover:text-amber-900"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">mail</span>
            <span>Email & Password</span>
          </button>
        </div>
      )}

      {/* 1. Mobile Number + OTP Flow */}
      {loginMethod === "phone" && (
        <>
          {/* STEP 1: Phone Input Only */}
          {otpStep === "phone_input" && (
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              <div>
                <label
                  htmlFor="mobile-phone"
                  className="block font-label-sm text-xs font-bold text-[#1C150C] mb-1.5"
                >
                  Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-2.5 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-amber-900/15 shadow-xs pointer-events-none">
                    <span className="text-sm">🇮🇳</span>
                    <span className="font-mono text-xs font-bold text-amber-950">
                      +91
                    </span>
                  </div>
                  <input
                    id="mobile-phone"
                    name="phoneInput"
                    type="tel"
                    inputMode="tel"
                    maxLength={10}
                    required
                    autoFocus
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""));
                      setClientError(null);
                    }}
                    placeholder="98765 43210"
                    className="w-full bg-[#FAF6EE] rounded-xl border border-amber-900/15 pl-24 pr-4 py-2.5 text-base sm:text-lg font-mono text-[#1C150C] focus:border-[#E64A19] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E64A19]/15 transition-all font-semibold tracking-wider placeholder:text-stone-400 placeholder:font-normal placeholder:text-sm"
                  />
                </div>
                <p className="text-[11px] text-amber-900/60 mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-amber-700">
                    shield
                  </span>
                  <span>We will send a 6-digit OTP for instant login.</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={phoneNumber.length < 10 || isSendingOtp || timerSeconds > 0}
                className={`w-full py-3 rounded-xl font-label-md text-xs uppercase tracking-widest font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  phoneNumber.length === 10 && !isSendingOtp && timerSeconds <= 0
                    ? "bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 shadow-lg shadow-[#E64A19]/25 text-white cursor-pointer active:scale-[0.99]"
                    : timerSeconds > 0
                      ? "bg-stone-100 text-stone-500 cursor-not-allowed border border-stone-200 shadow-none select-none"
                      : "bg-stone-200 text-stone-400 border border-stone-300/40 cursor-not-allowed shadow-none"
                }`}
              >
                {isSendingOtp ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : timerSeconds > 0 ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin text-amber-700">
                      progress_activity
                    </span>
                    <span>
                      {timerSeconds > 60
                        ? `Please wait ${Math.ceil(timerSeconds / 60)} min`
                        : `Please wait ${timerSeconds}s to Retry`}
                    </span>
                  </>
                ) : (
                  <>
                    <span>Get OTP via SMS</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: 6-Digit OTP Verification */}
          {otpStep === "otp_input" && (
            <form
              ref={otpFormRef}
              action={phoneOtpLoginAction}
              onSubmit={handleVerifyStep}
              className="space-y-4"
            >
              <input type="hidden" name="phone" value={phoneNumber} />
              <input type="hidden" name="name" value={fullName} />
              <input type="hidden" name="callbackUrl" value={callbackUrl} />

              {/* Verified Phone Badge Header */}
              <div className="bg-[#FAF6EE] px-3.5 py-2.5 rounded-xl border border-amber-900/10 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-amber-900/10 flex items-center justify-center text-amber-800 shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[18px]">smartphone</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-900/55 block">
                      Code sent to
                    </span>
                    <span className="font-mono font-bold text-amber-950 text-xs sm:text-sm tracking-wide">
                      {phoneNumber.replace(/[^0-9]/g, "").slice(-10).length === 10
                        ? `+91 ${phoneNumber.replace(/[^0-9]/g, "").slice(-10).slice(0, 5)} ${phoneNumber.replace(/[^0-9]/g, "").slice(-10).slice(5)}`
                        : `+91 ${phoneNumber}`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep("phone_input");
                    setOtpValue("");
                    setOtpDigits(["", "", "", "", "", ""]);
                    setClientError(null);
                    setIsFormValidated(false);
                  }}
                  className="text-xs font-bold text-amber-800 hover:text-[#E64A19] px-2.5 py-1 rounded-lg hover:bg-white/80 border border-transparent hover:border-amber-900/10 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>Change</span>
                </button>
              </div>

              <div>
                <label className="block font-label-sm text-xs font-bold text-[#1C150C] mb-2.5 text-center">
                  Enter 6-Digit Verification Code
                </label>

                {/* Hidden input to pass value to form submission */}
                <input type="hidden" name="otp" value={otpValue} />

                {/* Professional 6-Box Layout with 3+3 Split */}
                <div
                  onPaste={handleDigitPaste}
                  className={`flex items-center justify-center gap-2 sm:gap-3 my-2 ${
                    isShaking ? "animate-shake" : ""
                  }`}
                >
                  {/* First 3 boxes */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {[0, 1, 2].map((idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          digitInputRefs.current[idx] = el;
                        }}
                        id={`otp-box-${idx}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={idx === 0 ? 6 : 1}
                        autoComplete={idx === 0 ? "one-time-code" : "off"}
                        value={otpDigits[idx]}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleDigitChange(idx, e)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        onPaste={handleDigitPaste}
                        aria-label={`Digit ${idx + 1}`}
                        className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-bold rounded-[14px] border-[1.5px] transition-all duration-150 outline-none select-none shadow-xs ${
                          clientError
                            ? "border-red-400 bg-red-50/60 text-red-950 focus:border-red-600 focus:ring-4 focus:ring-red-400/15"
                            : otpDigits[idx]
                              ? "border-amber-700/60 bg-amber-500/[0.08] text-amber-950 focus:border-[#E64A19] focus:ring-4 focus:ring-[#E64A19]/15 scale-[1.02]"
                              : "border-stone-200 bg-white text-stone-900 hover:border-amber-900/30 focus:border-[#E64A19] focus:bg-white focus:ring-4 focus:ring-[#E64A19]/15 focus:scale-[1.02]"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Elegant Divider between 3 and 3 */}
                  <div className="w-2.5 h-0.5 bg-amber-900/30 rounded-full shrink-0 self-center" />

                  {/* Second 3 boxes */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {[3, 4, 5].map((idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          digitInputRefs.current[idx] = el;
                        }}
                        id={`otp-box-${idx}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        autoComplete="off"
                        value={otpDigits[idx]}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleDigitChange(idx, e)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        onPaste={handleDigitPaste}
                        aria-label={`Digit ${idx + 1}`}
                        className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-bold rounded-[14px] border-[1.5px] transition-all duration-150 outline-none select-none shadow-xs ${
                          clientError
                            ? "border-red-400 bg-red-50/60 text-red-950 focus:border-red-600 focus:ring-4 focus:ring-red-400/15"
                            : otpDigits[idx]
                              ? "border-amber-700/60 bg-amber-500/[0.08] text-amber-950 focus:border-[#E64A19] focus:ring-4 focus:ring-[#E64A19]/15 scale-[1.02]"
                              : "border-stone-200 bg-white text-stone-900 hover:border-amber-900/30 focus:border-[#E64A19] focus:bg-white focus:ring-4 focus:ring-[#E64A19]/15 focus:scale-[1.02]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Countdown Timer & Resend OTP */}
                <div className="mt-3 text-center">
                  {timerSeconds > 0 ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100/80 text-stone-600 text-xs font-medium border border-stone-200/60">
                      <span className="material-symbols-outlined text-[14px] text-amber-700 animate-spin">
                        progress_activity
                      </span>
                      <span>
                        Resend code in{" "}
                        <span className="font-mono font-bold text-amber-950">
                          0:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
                        </span>
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-stone-600">
                      Didn&apos;t receive code?{" "}
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={isSendingOtp}
                        className="font-bold text-amber-900 hover:text-[#E64A19] underline cursor-pointer transition-colors"
                      >
                        {isSendingOtp ? "Resending..." : "Resend OTP"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isVerifyingOtp || otpValue.length < 6}
                className={`w-full py-3 rounded-xl font-label-md text-xs uppercase tracking-widest font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  otpValue.length === 6 && !isSubmitting && !isVerifyingOtp
                    ? "bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 shadow-lg shadow-[#E64A19]/25 text-white cursor-pointer active:scale-[0.99]"
                    : "bg-stone-200 text-stone-400 border border-stone-300/40 cursor-not-allowed shadow-none"
                }`}
              >
                {isSubmitting || isVerifyingOtp ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <>
                    <span>{hasName ? "Verify & Sign In" : "Verify & Continue"}</span>
                    <span className="material-symbols-outlined text-[16px]">
                      {hasName ? "verified" : "arrow_forward"}
                    </span>
                  </>
                )}
              </button>

              {/* Secondary return to phone input */}
              <button
                type="button"
                onClick={() => {
                  setOtpStep("phone_input");
                  setOtpValue("");
                  setOtpDigits(["", "", "", "", "", ""]);
                  setClientError(null);
                  setIsFormValidated(false);
                }}
                className="w-full text-center text-[11px] text-stone-500 hover:text-amber-950 font-medium py-1 cursor-pointer transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[13px]">arrow_back</span>
                <span>Change mobile number</span>
              </button>
            </form>
          )}

          {/* STEP 3: Enter Full Name (New Users Only) */}
          {otpStep === "name_input" && (
            <form
              action={phoneOtpLoginAction}
              onSubmit={() => setIsSubmitting(true)}
              className="space-y-3.5 animate-in fade-in"
            >
              <input type="hidden" name="phone" value={phoneNumber} />
              <input type="hidden" name="otp" value={otpValue} />
              <input type="hidden" name="callbackUrl" value={callbackUrl} />

              <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-amber-900/10">
                <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-amber-900 bg-amber-500/15 px-2.5 py-0.5 rounded-full mb-1.5">
                  <span className="material-symbols-outlined text-[13px]">person_add</span>
                  <span>Almost Done!</span>
                </div>
                <h3 className="font-bold text-amber-950 text-sm sm:text-base">
                  What should we call you?
                </h3>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Enter your full name to personalize your orders &amp; delivery addresses.
                </p>
              </div>

              <div>
                <label
                  htmlFor="new-user-name"
                  className="block font-label-sm text-xs font-bold text-[#1C150C] mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="new-user-name"
                    name="name"
                    type="text"
                    required
                    minLength={2}
                    autoFocus
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-[#FAF6EE] rounded-xl border border-amber-900/15 pl-10 pr-4 py-2.5 text-sm text-[#1C150C] focus:border-[#E64A19] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E64A19]/15 transition-all font-medium placeholder:text-stone-400"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">
                    person
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !fullName.trim()}
                className={`w-full py-3 rounded-xl font-label-md text-xs uppercase tracking-widest font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  fullName.trim().length >= 2 && !isSubmitting
                    ? "bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 shadow-lg shadow-[#E64A19]/25 text-white cursor-pointer active:scale-[0.99]"
                    : "bg-stone-200 text-stone-400 border border-stone-300/40 cursor-not-allowed shadow-none"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Completing Sign In...</span>
                  </>
                ) : (
                  <>
                    <span>Complete &amp; Sign In</span>
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  </>
                )}
              </button>
            </form>
          )}
        </>
      )}

      {/* 2. Direct Email & Password Flow */}
      {loginMethod === "email" && (
        <form
          action={customerLoginAction}
          onSubmit={() => setIsSubmitting(true)}
          className="space-y-3"
        >
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          <div>
            <label
              htmlFor="email"
              className="block font-label-sm text-[11px] font-bold text-on-surface mb-1"
            >
              Email Address *
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full bg-[#FAF6EE] rounded-xl border border-amber-900/15 pl-9 pr-3 py-2 text-xs sm:text-sm text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-medium"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-amber-800/50 text-[18px]">
                mail
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="password"
                className="font-label-sm text-[11px] font-bold text-on-surface"
              >
                Password *
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full bg-[#FAF6EE] rounded-xl border border-amber-900/15 pl-9 pr-9 py-2 text-xs sm:text-sm text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-medium"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-amber-800/50 text-[18px]">
                lock
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-800/50 hover:text-amber-900 transition-colors p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <label className="flex items-center gap-1.5 text-on-surface-variant cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked
                className="w-3.5 h-3.5 rounded text-amber-700 accent-amber-700 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <a
              href="/support"
              className="text-amber-800 font-bold hover:text-[#E64A19] transition-colors"
            >
              Need help?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl font-label-md text-xs uppercase tracking-widest text-white bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 transition-all duration-300 shadow-vermillion-glow cursor-pointer active:scale-98 font-bold flex items-center justify-center gap-1.5 disabled:opacity-75"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In / Continue</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Divider & Google 1-Click Sign-In (shown on initial phone or email step) */}
      {(otpStep === "phone_input" || loginMethod === "email") && (
        <>
          <div className="relative flex py-0.5 items-center">
            <div className="flex-grow border-t border-amber-900/10"></div>
            <span className="shrink-0 mx-3 text-[10px] font-bold text-amber-900/45 uppercase tracking-widest">
              or
            </span>
            <div className="flex-grow border-t border-amber-900/10"></div>
          </div>

          <form action={googleSignInAction}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <button
              type="submit"
              className="w-full py-2.5 px-3 rounded-xl font-label-md text-xs font-bold uppercase tracking-wider text-[#1C150C] bg-white border border-amber-900/20 hover:border-amber-700 hover:bg-[#FAF6EE] transition-all duration-200 shadow-xs flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.41 7.33 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27a7.18 7.18 0 0 1 0-4.54V6.58H1.25a11.98 11.98 0 0 0 0 10.84l4.03-3.15Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.59 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>
        </>
      )}
    </div>
  );
}
