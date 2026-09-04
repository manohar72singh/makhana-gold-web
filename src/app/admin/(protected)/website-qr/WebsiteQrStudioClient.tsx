"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  generateAndSaveWebsiteQrAction,
  WebsiteQrSettings,
} from "./actions";

export function WebsiteQrStudioClient({
  initialSettings,
}: {
  initialSettings: WebsiteQrSettings;
}) {
  const [targetUrl, setTargetUrl] = useState(initialSettings.targetUrl);
  const [headline, setHeadline] = useState(initialSettings.headline);
  const [tagline, setTagline] = useState(initialSettings.tagline);
  const [colorDark, setColorDark] = useState(initialSettings.colorDark || "#160E08");
  const [pngDataUrl, setPngDataUrl] = useState(initialSettings.pngDataUrl);
  const [svgData, setSvgData] = useState(initialSettings.svgData);
  const [generatedAt, setGeneratedAt] = useState(initialSettings.generatedAt);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [printLayout, setPrintLayout] = useState<"single" | "sheet">("single");

  const artworkRef = useRef<HTMLDivElement>(null);

  // Form submission: Generate & Save to Database
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await generateAndSaveWebsiteQrAction(formData);

    setIsSaving(false);
    if (res.success && res.data) {
      setPngDataUrl(res.data.pngDataUrl);
      setSvgData(res.data.svgData);
      setGeneratedAt(res.data.generatedAt);
      setSaveMessage("✅ Lifetime Website QR generated and saved to MySQL database successfully!");
      setTimeout(() => setSaveMessage(null), 5000);
    } else {
      setSaveMessage(`❌ Error: ${res.error || "Failed to generate QR code."}`);
    }
  }

  // Trigger Browser Print
  function handlePrint(layout: "single" | "sheet") {
    setPrintLayout(layout);
    setTimeout(() => {
      window.print();
    }, 150);
  }

  // Download High-Res PNG
  function handleDownloadPng() {
    if (!pngDataUrl) return;
    const a = document.createElement("a");
    a.href = pngDataUrl;
    a.download = "makhana-gold-website-packaging-qr-300dpi.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Download Vector SVG
  function handleDownloadSvg() {
    if (!svgData) return;
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "makhana-gold-website-packaging-qr.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-amber-900/10 shadow-warm-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-amber-700 text-2xl">qr_code_2</span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-300/60">
              Packaging Asset Studio
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1C150C] tracking-tight">
            Lifetime Website Packaging QR Studio
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl">
            Generate and manage the official, permanent QR code for printing on all Makhana Gold product pouches,
            cartons, and marketing flyers. Stored permanently in the database.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active &amp; Lifetime Valid</span>
          </span>
        </div>
      </div>

      {saveMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
            saveMessage.startsWith("✅")
              ? "bg-emerald-50 text-emerald-900 border-emerald-300"
              : "bg-red-50 text-red-900 border-red-300"
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {saveMessage.startsWith("✅") ? "check_circle" : "error"}
          </span>
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: QR Generator Configuration Form */}
        <div className="lg:col-span-6 xl:col-span-5 bg-white rounded-3xl p-6 md:p-7 border border-amber-900/10 shadow-warm-1 space-y-5">
          <div className="border-b border-amber-900/10 pb-3">
            <h2 className="text-base font-bold text-amber-950 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-700 text-lg">tune</span>
              <span>QR Code &amp; Artwork Settings</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              These settings control what URL opens when the packaging QR is scanned.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Target URL */}
            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">
                Destination Website URL *
              </label>
              <input
                type="text"
                name="targetUrl"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://makhanagold.com"
                className="w-full px-4 py-2.5 rounded-xl border border-amber-900/20 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 bg-[#FAF6EE]"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Any customer scanning the pouch QR will instantly land on this URL.
              </span>
            </div>

            {/* Artwork Headline */}
            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">
                Packaging Label Headline
              </label>
              <input
                type="text"
                name="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Scan to Discover Pure Makhana Heritage"
                className="w-full px-4 py-2.5 rounded-xl border border-amber-900/20 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 bg-[#FAF6EE]"
              />
            </div>

            {/* Artwork Tagline */}
            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">
                Trust &amp; Verification Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Lab Tested • FSSAI & ISO Certified • 100% Traceable"
                className="w-full px-4 py-2.5 rounded-xl border border-amber-900/20 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 bg-[#FAF6EE]"
              />
            </div>

            {/* Dark Color Theme */}
            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                QR Code Color Tone
              </label>
              <div className="flex items-center gap-2">
                {[
                  { label: "Royal Umber (Brand)", value: "#160E08" },
                  { label: "Pure Obsidian", value: "#000000" },
                  { label: "Golden Bronze", value: "#3D2906" },
                ].map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColorDark(c.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      colorDark === c.value
                        ? "bg-amber-100 border-amber-700 text-amber-950 ring-1 ring-amber-600"
                        : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: c.value }} />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
              <input type="hidden" name="colorDark" value={colorDark} />
            </div>

            {/* Save & Generate Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D84315] to-amber-700 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">
                  {isSaving ? "hourglass_empty" : "save"}
                </span>
                <span>{isSaving ? "Generating & Saving to DB..." : "Generate & Save to Database"}</span>
              </button>
            </div>
          </form>

          {/* Direct Redirection Shortcode */}
          <div className="mt-6 pt-5 border-t border-amber-900/10 bg-[#FAF6EE] p-4 rounded-2xl">
            <span className="text-[11px] font-black uppercase text-amber-800 tracking-wider block mb-1">
              ⚡ Universal Packaging Short URL
            </span>
            <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-amber-900/15 font-mono text-xs">
              <span className="text-amber-950 font-bold truncate">https://makhanagold.com/qr</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("https://makhanagold.com/qr");
                  alert("Copied short URL to clipboard: https://makhanagold.com/qr");
                }}
                className="px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold cursor-pointer transition-colors shrink-0"
              >
                Copy
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 mt-1.5">
              This short URL automatically tracks scans and redirects to your destination URL above.
            </p>
          </div>
        </div>

        {/* Right Column: Live Packaging Sticker Preview & Actions */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-7 border border-amber-900/10 shadow-warm-1 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/10 pb-4">
              <div>
                <h2 className="text-base font-bold text-amber-950 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-700 text-lg">visibility</span>
                  <span>Packaging Label Artwork Preview</span>
                </h2>
                <p className="text-xs text-neutral-500">
                  Exact print mockup as it appears on the back of Makhana Gold pouches.
                </p>
              </div>

              {generatedAt && (
                <span className="text-[11px] text-neutral-500 font-mono">
                  Saved: {new Date(generatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              )}
            </div>

            {/* Preview Canvas / Card */}
            <div className="flex justify-center p-4 sm:p-6 bg-gradient-to-b from-[#FAF6EE] to-amber-50/50 rounded-2xl border border-amber-900/10">
              <div
                ref={artworkRef}
                className="w-full max-w-[340px] bg-white rounded-2xl p-6 border-2 border-amber-900/20 shadow-md text-center flex flex-col items-center relative overflow-hidden"
              >
                {/* Brand Logo & Title */}
                <div className="relative w-36 h-10 mb-2">
                  <Image
                    src="/images/logo/logo.png"
                    alt="Makhana Gold"
                    fill
                    sizes="144px"
                    className="object-contain"
                  />
                </div>

                <div className="text-[10px] font-black uppercase tracking-widest text-amber-800 mb-2">
                  100% Artisanal Bihar Superfood
                </div>

                {/* High Res QR Box */}
                <div className="p-3 bg-white border border-amber-900/15 rounded-2xl shadow-inner my-2 relative group">
                  {pngDataUrl ? (
                    <img
                      src={pngDataUrl}
                      alt="Official Website Packaging QR"
                      className="w-44 h-44 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center bg-amber-50 text-xs text-neutral-400">
                      Generating QR...
                    </div>
                  )}

                  <div className="absolute inset-0 bg-amber-950/80 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 p-3">
                    <span className="material-symbols-outlined text-3xl text-amber-300">crop_free</span>
                    <span className="text-xs font-bold text-center">Test with your smartphone camera now!</span>
                  </div>
                </div>

                {/* Headline & Tagline */}
                <div className="mt-2 text-xs font-black text-amber-950 px-2 leading-tight">
                  {headline}
                </div>
                <div className="text-[10px] text-neutral-600 mt-1 px-1 leading-normal">
                  {tagline}
                </div>

                {/* Compliance Badges Strip */}
                <div className="mt-3 pt-2.5 border-t border-amber-900/10 w-full flex items-center justify-center gap-3 text-[10px] font-mono text-amber-900 font-bold">
                  {initialSettings.fssaiNumber && (
                    <span className="inline-flex items-center gap-1">
                      <span className="font-sans text-[9px] uppercase tracking-wider text-amber-700 bg-amber-100 px-1 rounded">FSSAI</span>
                      <span>#{initialSettings.fssaiNumber}</span>
                    </span>
                  )}
                  {initialSettings.isoText && (
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-amber-600">verified</span>
                      <span>{initialSettings.isoText}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Export & Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {/* 1. Fullscreen View */}
              <button
                type="button"
                onClick={() => setViewModalOpen(true)}
                className="p-3 rounded-xl border border-amber-900/15 bg-white hover:bg-amber-50 text-amber-950 font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs hover:scale-102"
              >
                <span className="material-symbols-outlined text-xl text-amber-700">fullscreen</span>
                <span>View Full HD</span>
              </button>

              {/* 2. Print Label */}
              <button
                type="button"
                onClick={() => handlePrint("single")}
                className="p-3 rounded-xl border border-amber-900/15 bg-white hover:bg-amber-50 text-amber-950 font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs hover:scale-102"
              >
                <span className="material-symbols-outlined text-xl text-[#D84315]">print</span>
                <span>Print Sticker</span>
              </button>

              {/* 3. Download PNG */}
              <button
                type="button"
                onClick={handleDownloadPng}
                className="p-3 rounded-xl border border-amber-900/15 bg-white hover:bg-amber-50 text-amber-950 font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs hover:scale-102"
              >
                <span className="material-symbols-outlined text-xl text-emerald-700">download</span>
                <span>PNG (300 DPI)</span>
              </button>

              {/* 4. Download Vector SVG */}
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="p-3 rounded-xl border border-amber-900/15 bg-white hover:bg-amber-50 text-amber-950 font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs hover:scale-102"
              >
                <span className="material-symbols-outlined text-xl text-blue-700">draw</span>
                <span>Vector SVG</span>
              </button>
            </div>

            {/* Printing Options Card */}
            <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-amber-900/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-amber-700">local_printshop</span>
                  <span>Direct Factory Packaging Print Options</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrint("single")}
                    className="text-[11px] font-bold px-3 py-1 rounded-lg bg-white border border-amber-900/20 text-amber-900 hover:bg-amber-100 cursor-pointer"
                  >
                    1x Single Pouch (50x50mm)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrint("sheet")}
                    className="text-[11px] font-bold px-3 py-1 rounded-lg bg-amber-800 text-white hover:bg-amber-900 cursor-pointer"
                  >
                    12x A4 Sheet (3x4 Grid)
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-neutral-600">
                Clicking either option opens the print dialogue with precise sticker dimensions ready for peeling label sheets.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 Modal: Fullscreen HD View */}
      {viewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-amber-900/20 shadow-2xl relative text-center space-y-4">
            <button
              type="button"
              onClick={() => setViewModalOpen(false)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-900 p-1.5 rounded-full hover:bg-neutral-100 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="relative w-40 h-12 mx-auto">
              <Image
                src="/images/logo/logo.png"
                alt="Makhana Gold"
                fill
                sizes="160px"
                className="object-contain"
              />
            </div>

            <h3 className="text-base font-black text-[#1C150C]">
              Scan Packaging QR Code
            </h3>

            <div className="p-4 bg-[#FAF6EE] rounded-2xl border border-amber-900/10 inline-block">
              {pngDataUrl && (
                <img
                  src={pngDataUrl}
                  alt="High Resolution Website QR"
                  className="w-64 h-64 mx-auto object-contain"
                />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-mono font-bold text-amber-900 truncate">
                Target: {targetUrl}
              </p>
              <p className="text-[11px] text-neutral-500">
                Open phone camera to test instant scanning.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <span>Test Link in Browser</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🖨️ Dedicated CSS Print Stylesheet and Container */}
      <div id="packaging-qr-print-area" className="hidden print:block">
        {printLayout === "single" ? (
          <div className="print-sticker-single">
            <div className="sticker-content">
              <div className="brand-header">
                <strong>MAKHANA GOLD</strong>
                <span>100% PURE BIHAR SUPERFOOD</span>
              </div>
              {pngDataUrl && (
                <img src={pngDataUrl} alt="Packaging QR" className="qr-img" />
              )}
              <div className="qr-caption">{headline}</div>
              <div className="qr-url">{targetUrl}</div>
              <div className="qr-compliance">
                <span>FSSAI: {initialSettings.fssaiNumber}</span> | <span>{initialSettings.isoText}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="print-sticker-sheet">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="sticker-sheet-cell">
                <div className="brand-header-mini">MAKHANA GOLD</div>
                {pngDataUrl && (
                  <img src={pngDataUrl} alt="Packaging QR" className="qr-img-mini" />
                )}
                <div className="qr-caption-mini">Scan for Purity &amp; Tests</div>
                <div className="qr-url-mini">{targetUrl.replace(/^https?:\/\//, "")}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          /* Hide all non-printable admin UI */
          body * {
            visibility: hidden;
          }
          #packaging-qr-print-area,
          #packaging-qr-print-area * {
            visibility: visible;
          }
          #packaging-qr-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff;
            padding: 10mm;
          }

          /* Single sticker layout (50mm x 50mm approx) */
          .print-sticker-single {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .sticker-content {
            width: 70mm;
            border: 2px dashed #000;
            padding: 4mm;
            text-align: center;
            font-family: sans-serif;
            background: #fff;
          }
          .brand-header strong {
            display: block;
            font-size: 14pt;
            letter-spacing: 1px;
            color: #000;
          }
          .brand-header span {
            font-size: 7pt;
            letter-spacing: 0.5px;
            color: #333;
          }
          .qr-img {
            width: 45mm;
            height: 45mm;
            margin: 2mm auto;
            display: block;
          }
          .qr-caption {
            font-size: 8pt;
            font-weight: bold;
            color: #000;
            margin-top: 1mm;
          }
          .qr-url {
            font-size: 7pt;
            font-family: monospace;
            color: #444;
          }
          .qr-compliance {
            font-size: 6pt;
            font-weight: bold;
            margin-top: 1.5mm;
            border-top: 1px solid #ccc;
            padding-top: 1mm;
          }

          /* 12-up A4 Sticker Sheet (3 cols x 4 rows) */
          .print-sticker-sheet {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6mm;
            width: 190mm;
            margin: 0 auto;
          }
          .sticker-sheet-cell {
            border: 1px solid #ddd;
            padding: 3mm;
            text-align: center;
            font-family: sans-serif;
            border-radius: 4px;
          }
          .brand-header-mini {
            font-size: 8pt;
            font-weight: 900;
            letter-spacing: 0.5px;
          }
          .qr-img-mini {
            width: 32mm;
            height: 32mm;
            margin: 1.5mm auto;
            display: block;
          }
          .qr-caption-mini {
            font-size: 6.5pt;
            font-weight: bold;
          }
          .qr-url-mini {
            font-size: 5.5pt;
            font-family: monospace;
            color: #555;
          }
        }
      `}</style>
    </div>
  );
}
