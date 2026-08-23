"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AmazonIcon,
  FlipkartIcon,
  BlinkitIcon,
  ZeptoIcon,
  InstamartIcon,
} from "./MarketplaceLogos";

export interface HeroSlide {
  id: string;
  badge: string;
  badgeColor?: string;
  title: string;
  highlightTitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  bgImage: string;
  theme: "light" | "dark";
  socialProof?: string;
  showMarketplaceLogos?: boolean;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "signature-harvest",
    badge: "✨ Artisanal Harvest 2026 • 100% Wetland Superfood",
    badgeColor: "bg-amber-500/15 border-amber-500/30 text-amber-900",
    title: "Nature's Purest Crunch.",
    highlightTitle: "Now in Gold.",
    description:
      "Discover the ancient royal heritage and modern wellness of our hand-selected, slow-roasted Fox Nuts. A guilt-free luxury crafted for your daily mindful pantry.",
    ctaText: "Shop The Collection",
    ctaLink: "/shop",
    secondaryCtaText: "Our Heritage Story",
    secondaryCtaLink: "/our-story",
    bgImage: "/images/vibrant/hero.jpg",
    theme: "light",
    socialProof: "4.9/5 Rating by 12,000+ Conscious Foodies across India",
  },
  {
    id: "marketplace-availability",
    badge: "🚀 NATIONWIDE • Amazon • Flipkart • Blinkit • Zepto",
    badgeColor: "bg-amber-500/25 border-amber-400/50 text-amber-300",
    title: "Order Makhana Gold On",
    highlightTitle: "India's Top Apps.",
    description:
      "Get authentic slow-roasted Bihar fox nuts on Amazon Prime, Flipkart Assured, Blinkit (10 mins), Zepto, and Instamart. Or order directly for 15% off!",
    ctaText: "Shop Flagship (15% Off)",
    ctaLink: "/shop",
    bgImage: "/images/banners/marketplace_bottom_banner.jpg",
    theme: "dark",
    socialProof: "⚡ 1-Day Prime • 10-Min Quick Commerce • 100% Certified Origin",
    showMarketplaceLogos: true,
  },
  {
    id: "new-launch-truffle",
    badge: "🔥 NEW LAUNCH • Limited Reserve Edition",
    badgeColor: "bg-amber-500/25 border-amber-400/50 text-amber-300",
    title: "Black Truffle & Aged Herb.",
    highlightTitle: "Gourmet Elegance.",
    description:
      "Infused with Italian black summer truffle glaze, pure cold-pressed oils, and sea salt crystals. An unprecedented culinary experience for the true connoisseur.",
    ctaText: "Explore New Launch (15% Off)",
    ctaLink: "/product/truffle-parmesan-makhana",
    secondaryCtaText: "View All Flavours",
    secondaryCtaLink: "/shop",
    bgImage: "/images/vibrant/new-launch.jpg",
    theme: "dark",
    socialProof: "⚡ Limited First Batch: Only 500 Tins Hand-Packed at Origin",
  },
  {
    id: "festive-heritage-gift",
    badge: "🎁 ROYAL GIFT COLLECTION • Handcrafted Hamper",
    badgeColor: "bg-emerald-600/20 border-emerald-500/40 text-emerald-900",
    title: "The Heritage Gift Hamper.",
    highlightTitle: "Share The Royalty.",
    description:
      "An opulent emerald and gold embossed treasure box featuring all our signature flavours. The most thoughtful, nourishing gift for loved ones and festive celebrations.",
    ctaText: "Order Gift Hamper",
    ctaLink: "/product/heritage-bundle",
    secondaryCtaText: "Corporate Gifting",
    secondaryCtaLink: "/support",
    bgImage: "/images/products/heritage-bundle.jpg",
    theme: "light",
    socialProof: "Includes Custom Handwritten Wax-Sealed Gift Card",
  },
];

export function HeroBannerSlider({
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 6000,
}: {
  slides?: HeroSlide[];
  autoPlayInterval?: number;
}) {
  const displaySlides = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Auto-play timer
  useEffect(() => {
    if (isPaused || displaySlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, displaySlides.length, autoPlayInterval]);

  function prevSlide() {
    setCurrentIndex((prev) => (prev === 0 ? displaySlides.length - 1 : prev - 1));
  }

  function nextSlide() {
    setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
  }

  // Swipe handling for mobile — ignore vertical swipes (scrolling)
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Only swipe if horizontal movement is dominant
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }

  const currentSlide = displaySlides[currentIndex] || displaySlides[0];
  const isDark = currentSlide.theme === "dark";

  return (
    <section
      className="relative w-full overflow-hidden bg-[#FAF6EE] min-h-[480px] sm:min-h-[500px] md:min-h-[520px] flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Makhana Gold Featured Highlights"
    >
      {/* Background Slides with Crossfade */}
      {displaySlides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? "opacity-100 z-0" : "opacity-0 -z-10"
          }`}
        >
          <Image
            src={slide.bgImage || "/images/vibrant/hero.jpg"}
            alt={slide.title}
            fill
            priority={idx === 0}
            sizes="100vw"
            unoptimized={Boolean(slide.bgImage && (slide.bgImage.startsWith("http") || slide.bgImage.startsWith("/uploads")))}
            className="object-cover object-center"
          />

          {/* Dynamic Gradient Overlays based on slide theme */}
          {slide.theme === "dark" ? (
            <>
              {/* Mobile: full dark overlay; Desktop: left-side gradient */}
              <div className="absolute inset-0 bg-[#120D06]/75 md:bg-transparent md:bg-gradient-to-r md:from-[#120D06] md:via-[#120D06]/90 md:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120D06]/95 via-transparent to-transparent" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-[#FFFDF9]/75 md:bg-transparent md:bg-gradient-to-r md:from-[#FFFDF9] md:via-[#FFFDF9]/90 md:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FAF6EE]/90 via-transparent to-transparent" />
            </>
          )}
        </div>
      ))}

      {/* Main Content Area */}
      <div className="relative z-10 max-w-container-max mx-auto w-full px-5 sm:px-gutter py-8 md:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8 lg:col-span-7 max-w-2xl">
          {/* Badge — truncated on tiny screens */}
          <div
            key={`badge-${currentIndex}`}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] sm:text-xs tracking-wider uppercase mb-3 shadow-xs backdrop-blur-md transition-all duration-500 max-w-full overflow-hidden ${
              currentSlide.badgeColor ||
              (isDark
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-amber-500/15 text-amber-900 border-amber-500/30")
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isDark ? "bg-amber-400" : "bg-amber-600"
              } animate-ping`}
            />
            <span className="font-bold truncate">{currentSlide.badge}</span>
          </div>

          {/* Main Title */}
          <h1
            key={`title-${currentIndex}`}
            className={`font-display-lg text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-3 leading-[1.15] transition-all duration-500 ${
              isDark ? "text-white" : "text-[#1C150C]"
            }`}
          >
            {currentSlide.title} <br />
            <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 bg-clip-text text-transparent italic font-normal drop-shadow-xs">
              {currentSlide.highlightTitle}
            </span>
          </h1>

          {/* Description — shorter on mobile */}
          <p
            key={`desc-${currentIndex}`}
            className={`font-body-lg text-xs sm:text-sm mb-4 max-w-xl leading-relaxed font-medium transition-all duration-500 line-clamp-3 sm:line-clamp-none ${
              isDark ? "text-amber-100/90" : "text-[#594D3B]"
            }`}
          >
            {currentSlide.description}
          </p>

          {/* Marketplace Logos in Slide (If Active) */}
          {currentSlide.showMarketplaceLogos && (
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 mb-4">
              <a
                href="https://www.amazon.in/s?k=Makhana+Gold"
                target="_blank"
                rel="noopener noreferrer"
                title="Buy on Amazon"
                className="p-1.5 rounded-xl bg-white text-gray-900 border border-white/40 shadow-xs hover:scale-105 hover:border-[#FF9900] transition-all flex items-center gap-1.5 cursor-pointer justify-center sm:justify-start"
              >
                <AmazonIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[10px] sm:text-[11px] font-extrabold pr-1">Amazon</span>
              </a>
              <a
                href="https://www.flipkart.com/search?q=Makhana+Gold"
                target="_blank"
                rel="noopener noreferrer"
                title="Buy on Flipkart"
                className="p-1.5 rounded-xl bg-white text-gray-900 border border-white/40 shadow-xs hover:scale-105 hover:border-[#2874F0] transition-all flex items-center gap-1.5 cursor-pointer justify-center sm:justify-start"
              >
                <FlipkartIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[10px] sm:text-[11px] font-extrabold pr-1">Flipkart</span>
              </a>
              <a
                href="https://blinkit.com/s/?q=Makhana+Gold"
                target="_blank"
                rel="noopener noreferrer"
                title="Buy on Blinkit"
                className="p-1.5 rounded-xl bg-white text-gray-900 border border-white/40 shadow-xs hover:scale-105 hover:border-[#0C831F] transition-all flex items-center gap-1.5 cursor-pointer justify-center sm:justify-start"
              >
                <BlinkitIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[10px] sm:text-[11px] font-extrabold pr-1">Blinkit</span>
              </a>
              <a
                href="https://www.zeptonow.com/search?q=Makhana+Gold"
                target="_blank"
                rel="noopener noreferrer"
                title="Buy on Zepto"
                className="p-1.5 rounded-xl bg-white text-gray-900 border border-white/40 shadow-xs hover:scale-105 hover:border-[#7A1CAC] transition-all flex items-center gap-1.5 cursor-pointer justify-center sm:justify-start"
              >
                <ZeptoIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[10px] sm:text-[11px] font-extrabold pr-1">Zepto</span>
              </a>
              <a
                href="https://www.swiggy.com/instamart"
                target="_blank"
                rel="noopener noreferrer"
                title="Buy on Swiggy Instamart"
                className="p-1.5 rounded-xl bg-white text-gray-900 border border-white/40 shadow-xs hover:scale-105 hover:border-[#FC8019] transition-all flex items-center gap-1.5 cursor-pointer justify-center sm:justify-start"
              >
                <InstamartIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[10px] sm:text-[11px] font-extrabold pr-1">Instamart</span>
              </a>
            </div>
          )}

          {/* CTA Buttons — full width on mobile, inline on sm+ */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-4">
            <Link
              href={currentSlide.ctaLink}
              className="bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:from-[#d84315] hover:to-[#bf360c] text-white px-6 py-3 sm:py-2.5 rounded-xl font-label-md text-xs uppercase tracking-widest transition-all duration-300 shadow-vermillion-glow hover:shadow-warm-3 inline-flex items-center justify-center gap-2 active:scale-98 cursor-pointer font-bold"
            >
              <span>{currentSlide.ctaText}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>

            {currentSlide.secondaryCtaText && (
              <Link
                href={currentSlide.secondaryCtaLink || "/shop"}
                className={`border-2 px-5 py-3 sm:py-2.5 rounded-xl font-label-md text-xs uppercase tracking-wider transition-all inline-flex items-center justify-center backdrop-blur-md shadow-xs font-bold ${
                  isDark
                    ? "border-amber-400/40 text-amber-200 hover:bg-amber-500/10 hover:border-amber-300"
                    : "border-amber-900/20 hover:border-amber-800 bg-white/70 hover:bg-white text-[#1C150C]"
                }`}
              >
                {currentSlide.secondaryCtaText}
              </Link>
            )}
          </div>

          {/* Social Proof */}
          {currentSlide.socialProof && (
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xs transition-all duration-500 backdrop-blur-md ${
                isDark
                  ? "bg-white/10 border-white/15 text-amber-200"
                  : "bg-white/85 border-amber-900/10 text-[#1C150C]"
              }`}
            >
              <div className="flex text-amber-500">
                {"★★★★★".split("").map((_, i) => (
                  <span key={i} className="text-xs">★</span>
                ))}
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium line-clamp-1">
                {currentSlide.socialProof}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows — visible on all sizes, smaller on mobile */}
      <button
        onClick={prevSlide}
        className="flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-on-surface shadow-warm-1 hover:shadow-warm-2 items-center justify-center transition-all z-20 backdrop-blur-sm cursor-pointer active:scale-95"
        aria-label="Previous Slide"
      >
        <span className="material-symbols-outlined text-xl sm:text-2xl">chevron_left</span>
      </button>

      <button
        onClick={nextSlide}
        className="flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-on-surface shadow-warm-1 hover:shadow-warm-2 items-center justify-center transition-all z-20 backdrop-blur-sm cursor-pointer active:scale-95"
        aria-label="Next Slide"
      >
        <span className="material-symbols-outlined text-xl sm:text-2xl">chevron_right</span>
      </button>

      {/* Slide Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
        {displaySlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentIndex
                ? "w-6 sm:w-7 h-2 bg-gradient-to-r from-amber-400 to-amber-500 shadow-xs"
                : "w-2 h-2 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
