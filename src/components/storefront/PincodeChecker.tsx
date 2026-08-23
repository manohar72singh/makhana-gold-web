"use client";

import { useState, useEffect } from "react";

export function PincodeChecker() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<{
    city: string;
    deliveryDays: string;
    deliveryDateStr: string;
    courierPartner?: string;
    isMetro: boolean;
  } | null>(null);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Load previously saved pincode from local storage
    const savedPin = localStorage.getItem("mg_user_pincode");
    if (savedPin && savedPin.length === 6) {
      setPincode(savedPin);
      evaluatePincode(savedPin);
    }
  }, []);

  async function evaluatePincode(pin: string) {
    setError("");
    const cleaned = pin.trim().replace(/[^0-9]/g, "");

    if (cleaned.length !== 6) {
      setError("Please enter a valid 6-digit PIN code.");
      setResult(null);
      return;
    }

    setIsChecking(true);

    try {
      const res = await fetch(`/api/shipping/serviceability?pincode=${cleaned}`);
      const json = await res.json();

      if (json.success && json.data) {
        const d = json.data;
        setResult({
          city: d.city,
          deliveryDays: d.estimatedDeliveryDays,
          deliveryDateStr: d.estimatedDeliveryDate,
          courierPartner: d.courierPartner,
          isMetro: d.isMetro,
        });
        localStorage.setItem("mg_user_pincode", cleaned);
      } else {
        setError(json.error || "Pincode is currently not serviceable.");
        setResult(null);
      }
    } catch (err) {
      console.error("Serviceability check error:", err);
      // Fallback
      setResult({
        city: "Standard Zone",
        deliveryDays: "3 - 5 Days",
        deliveryDateStr: "3 - 5 Days",
        isMetro: false,
      });
    } finally {
      setIsChecking(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    evaluatePincode(pincode);
  }

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF6EE] border border-amber-900/10 mb-5">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-label-md text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#D84315]">local_shipping</span>
          Estimated Delivery &amp; COD
        </span>
        {result && (
          <button
            onClick={() => {
              setResult(null);
              setPincode("");
              localStorage.removeItem("mg_user_pincode");
            }}
            className="text-[10px] text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
          >
            Change PIN
          </button>
        )}
      </div>

      {!result ? (
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Enter 6-digit Pincode"
              className="w-full bg-white border border-amber-900/20 rounded-xl px-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:border-[#D84315] shadow-xs"
            />
          </div>
          <button
            type="submit"
            disabled={isChecking || pincode.length !== 6}
            className="px-4 py-2 rounded-xl bg-[#D84315] hover:bg-secondary text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
          >
            {isChecking ? "Checking..." : "Check"}
          </button>
        </form>
      ) : (
        <div className="space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-700">
              Delivery to <strong className="text-amber-950">{pincode}</strong> ({result.city}):
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              By {result.deliveryDateStr}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-neutral-700 font-medium">
            <div className="flex items-center gap-1.5 text-emerald-800">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
              <span>Cash on Delivery Available</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
              <span>
                {result.courierPartner ? `Via ${result.courierPartner}` : "Express Courier"}
              </span>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-600 text-[11px] mt-1.5 font-medium">{error}</p>}
    </div>
  );
}
