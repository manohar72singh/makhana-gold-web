"use client";

import { useState } from "react";
import { customerLoginAction, googleSignInAction, phoneOtpLoginAction } from "./actions";

export function LoginFormClient({
  error,
  callbackUrl,
}: {
  error?: string;
  callbackUrl: string;
}) {
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [otpStep, setOtpStep] = useState<"phone_input" | "otp_input">("phone_input");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
    if (!fullName.trim() || cleanPhone.length < 10) return;
    setOtpStep("otp_input");
  }

  return (
    <div className="space-y-3.5">
      {/* Error Alert */}
      {error && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] shrink-0 text-red-600">error</span>
          <span>
            {error === "OtpError"
              ? "Invalid OTP. Please enter a valid 4-digit OTP."
              : "Invalid credentials. Please check and try again."}
          </span>
        </div>
      )}

      {/* Login Method Toggle Tabs */}
      <div className="flex bg-[#FAF6EE] p-1 rounded-2xl border border-amber-900/10">
        <button
          type="button"
          onClick={() => {
            setLoginMethod("phone");
            setOtpStep("phone_input");
          }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
          onClick={() => setLoginMethod("email")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            loginMethod === "email"
              ? "bg-white text-amber-950 shadow-xs border border-amber-900/10"
              : "text-[#66553E] hover:text-amber-900"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">mail</span>
          <span>Email & Password</span>
        </button>
      </div>

      {/* 1. Mobile Number + Name + OTP Flow */}
      {loginMethod === "phone" && (
        <>
          {otpStep === "phone_input" ? (
            <form onSubmit={handleSendOtp} className="space-y-3">
              <div>
                <label
                  htmlFor="user-name"
                  className="block font-label-sm text-[11px] font-bold text-on-surface mb-1"
                >
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    id="user-name"
                    name="nameInput"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full bg-[#FAF6EE] rounded-xl border border-amber-900/15 pl-9 pr-3 py-2 text-xs sm:text-sm text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-medium"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-amber-800/50 text-[18px]">
                    person
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="mobile-phone"
                  className="block font-label-sm text-[11px] font-bold text-on-surface mb-1"
                >
                  Mobile Number *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 font-mono text-xs font-bold text-amber-900/80 bg-white px-1.5 py-0.5 rounded-md border border-amber-900/15">
                    🇮🇳 +91
                  </span>
                  <input
                    id="mobile-phone"
                    name="phoneInput"
                    type="tel"
                    maxLength={10}
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="10-digit mobile number"
                    className="w-full bg-[#FAF6EE] rounded-xl border border-amber-900/15 pl-20 pr-3 py-2 text-xs sm:text-sm font-mono text-[#1C150C] focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={phoneNumber.length < 10 || !fullName.trim()}
                className="w-full py-2.5 rounded-xl font-label-md text-xs uppercase tracking-widest text-white bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 transition-all duration-300 shadow-vermillion-glow cursor-pointer active:scale-98 font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>Get OTP</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </form>
          ) : (
            <form
              action={phoneOtpLoginAction}
              onSubmit={() => setIsSubmitting(true)}
              className="space-y-3"
            >
              <input type="hidden" name="name" value={fullName} />
              <input type="hidden" name="phone" value={phoneNumber} />
              <input type="hidden" name="callbackUrl" value={callbackUrl} />

              <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 flex items-center justify-between text-xs">
                <div>
                  {fullName && <span className="font-bold text-amber-950 block">{fullName}</span>}
                  <span className="font-mono text-amber-900/80 text-[11px]">+91 {phoneNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpStep("phone_input")}
                  className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              <div>
                <label
                  htmlFor="otp"
                  className="block font-label-sm text-[11px] font-bold text-on-surface mb-1"
                >
                  Enter 4-Digit OTP *
                </label>
                <div className="relative">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="e.g. 1234"
                    className="w-full bg-[#FAF6EE] rounded-xl border border-amber-900/15 pl-9 pr-3 py-2 text-base tracking-widest font-mono text-[#1C150C] text-center focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-bold"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-amber-800/50 text-[18px]">
                    pin
                  </span>
                </div>
                <p className="text-[10px] text-amber-800/80 mt-1 text-center font-medium">
                  💡 Testing OTP: Use <strong className="text-amber-950">1234</strong> (or any 4 digits)
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otpValue.length < 4}
                className="w-full py-2.5 rounded-xl font-label-md text-xs uppercase tracking-widest text-white bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 transition-all duration-300 shadow-vermillion-glow cursor-pointer active:scale-98 font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Sign In</span>
                    <span className="material-symbols-outlined text-[15px]">verified</span>
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

      {/* Divider */}
      <div className="relative flex py-0.5 items-center">
        <div className="flex-grow border-t border-amber-900/10"></div>
        <span className="shrink-0 mx-3 text-[10px] font-bold text-amber-900/45 uppercase tracking-widest">
          or
        </span>
        <div className="flex-grow border-t border-amber-900/10"></div>
      </div>

      {/* 3. Google 1-Click Sign-In */}
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
    </div>
  );
}
