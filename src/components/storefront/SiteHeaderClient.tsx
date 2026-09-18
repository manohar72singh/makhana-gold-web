"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { customerLogoutAction } from "@/app/(storefront)/account/actions";
import { SearchModalClient } from "./SearchModalClient";

export interface HeaderCategoryChild {
  id: number;
  name: string;
  slug: string;
}

export interface HeaderCategoryParent {
  id: number;
  name: string;
  slug: string;
  children: HeaderCategoryChild[];
}

export function SiteHeaderClient({
  cartCount,
  isLoggedIn,
  userName,
  categoryTree = [],
}: {
  cartCount: number;
  isLoggedIn: boolean;
  userName?: string | null;
  categoryTree?: HeaderCategoryParent[];
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileShopExpanded, setMobileShopExpanded] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [b2bDropdownOpen, setB2bDropdownOpen] = useState(false);
  const [mobileB2bExpanded, setMobileB2bExpanded] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const b2bDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  // Bump the cart icon whenever an item is added anywhere on the site
  useEffect(() => {
    function handleCartAdded() {
      setCartBump(true);
      setTimeout(() => setCartBump(false), 550);
    }
    window.addEventListener("cart:added", handleCartAdded);
    return () => window.removeEventListener("cart:added", handleCartAdded);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setShopDropdownOpen(false);
    setB2bDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Keyboard shortcut listener (/ or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "/" || (e.ctrlKey && e.key === "k")) && !searchModalOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          setSearchModalOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchModalOpen]);

  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setShopDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setShopDropdownOpen(false);
    }, 200);
  };

  const handleB2bDropdownEnter = () => {
    if (b2bDropdownTimeoutRef.current) clearTimeout(b2bDropdownTimeoutRef.current);
    setB2bDropdownOpen(true);
  };

  const handleB2bDropdownLeave = () => {
    b2bDropdownTimeoutRef.current = setTimeout(() => {
      setB2bDropdownOpen(false);
    }, 200);
  };

  const PILLAR_ICONS: Record<string, string> = {
    makhana: "👑",
    sattu: "🥣",
    poha: "🌾",
  };

  const PILLAR_SUBTITLES: Record<string, string> = {
    makhana: "Bihar Wetland Fox Nuts",
    sattu: "Cold Stone-Ground Gram Flour",
    poha: "Whole Grain Flattened Rice",
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-amber-900/10 sticky top-0 z-50 w-full transition-all duration-300 shadow-xs">
        <div className="flex justify-between items-center h-20 px-gutter max-w-container-max mx-auto">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile menu"
            className="lg:hidden text-amber-900 p-2 -ml-2 hover:bg-[#FAF6EE] rounded-xl transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[26px]">menu</span>
          </button>

          {/* Official Brand Logo */}
          <Link
            href="/"
            className="flex items-center shrink-0 hover:scale-102 transition-transform duration-300 mr-2 md:mr-6"
          >
            <div className="relative w-36 h-12 sm:w-44 sm:h-14">
              <Image
                src="/images/logo/logo.png"
                alt="Makhana Gold - Pure, Healthy, Premium"
                fill
                priority
                sizes="176px"
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation (Tabs + Mega Dropdown) */}
          <nav className="hidden lg:flex flex-1 justify-center items-center space-x-0.5 xl:space-x-1.5">
            {/* 🌟 1. SHOP WITH MEGA DROPDOWN */}
            <div
              className="relative"
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <Link
                href="/shop"
                onClick={() => setShopDropdownOpen(false)}
                className={`whitespace-nowrap px-2.5 xl:px-3.5 py-1.5 rounded-full font-label-md text-[11px] xl:text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-1 font-bold ${
                  pathname.startsWith("/shop")
                    ? "bg-amber-500/15 text-amber-950 font-extrabold border border-amber-500/40 shadow-xs"
                    : "text-[#4A3B28] hover:text-amber-900 hover:bg-[#FAF6EE]"
                }`}
              >
                <span>Shop</span>
                <span className={`material-symbols-outlined text-[15px] transition-transform duration-200 ${shopDropdownOpen ? "rotate-180" : ""}`}>
                  keyboard_arrow_down
                </span>
              </Link>

              {/* 👑 MEGA DROPDOWN MENU */}
              {shopDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[720px] bg-white rounded-3xl shadow-2xl border border-amber-900/15 p-6 animate-in fade-in zoom-in-95 duration-200 z-50">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-900/10">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#D84315] flex items-center gap-1.5">
                      <span>✨</span>
                      <span>Artisanal Superfoods Catalog</span>
                    </span>
                    <Link
                      href="/shop"
                      onClick={() => setShopDropdownOpen(false)}
                      className="text-xs text-amber-800 hover:text-[#D84315] font-bold flex items-center gap-1 hover:underline"
                    >
                      <span>Explore All Products</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>

                  {/* 3 Main Pillars Grid */}
                  <div className="grid grid-cols-3 gap-5">
                    {categoryTree.map((parent) => (
                      <div
                        key={parent.slug}
                        className="p-3.5 rounded-2xl bg-[#FAF6EE]/60 border border-amber-900/10 hover:border-amber-400 hover:bg-[#FAF6EE] transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Pillar Header */}
                          <Link
                            href={`/shop?category=${parent.slug}`}
                            onClick={() => setShopDropdownOpen(false)}
                            className="group block mb-2.5"
                          >
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-lg">{PILLAR_ICONS[parent.slug] || "📦"}</span>
                              <h4 className="font-headline-sm text-sm font-black text-amber-950 group-hover:text-[#D84315] transition-colors">
                                {parent.name}
                              </h4>
                            </div>
                            <p className="text-[10px] text-amber-800/70 font-medium">
                              {PILLAR_SUBTITLES[parent.slug] || "Artisanal Harvest"}
                            </p>
                          </Link>

                          {/* Sub-categories List */}
                          <ul className="space-y-1.5 mb-3">
                            {parent.children.map((child) => (
                              <li key={child.slug}>
                                <Link
                                  href={`/shop?category=${child.slug}`}
                                  onClick={() => setShopDropdownOpen(false)}
                                  className="text-xs text-[#5C4D3C] hover:text-[#D84315] hover:font-bold transition-colors flex items-center gap-1.5 py-0.5"
                                >
                                  <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                                  <span className="line-clamp-1">{child.name}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* View All Pillar Link */}
                        <Link
                          href={`/shop?category=${parent.slug}`}
                          onClick={() => setShopDropdownOpen(false)}
                          className="text-[11px] font-bold text-[#D84315] hover:underline pt-2 border-t border-amber-900/10 flex items-center justify-between"
                        >
                          <span>All {parent.name.split(" ")[0]}</span>
                          <span>→</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. OTHER NAV TABS */}
            <Link
              href="/our-story"
              className={`whitespace-nowrap px-2.5 xl:px-3.5 py-1.5 rounded-full font-label-md text-[11px] xl:text-xs uppercase tracking-wider transition-all duration-200 font-bold ${
                pathname === "/our-story"
                  ? "bg-amber-500/15 text-amber-950 font-extrabold border border-amber-500/40 shadow-xs"
                  : "text-[#4A3B28] hover:text-amber-900 hover:bg-[#FAF6EE]"
              }`}
            >
              Our Story
            </Link>

            <Link
              href="/offers"
              className={`whitespace-nowrap px-2.5 xl:px-3.5 py-1.5 rounded-full font-label-md text-[11px] xl:text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-1 font-bold ${
                pathname === "/offers"
                  ? "bg-amber-500/15 text-amber-950 font-extrabold border border-amber-500/40 shadow-xs"
                  : "text-[#4A3B28] hover:text-amber-900 hover:bg-[#FAF6EE]"
              }`}
            >
              <span>Offers</span>
              <span className="bg-gradient-to-r from-[#E64A19] to-[#D84315] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-xs animate-pulse">
                15% OFF
              </span>
            </Link>

            {/* 3. CORPORATE & BULK B2B DROPDOWN */}
            <div
              className="relative"
              onMouseEnter={handleB2bDropdownEnter}
              onMouseLeave={handleB2bDropdownLeave}
            >
              <button
                type="button"
                onClick={() => setB2bDropdownOpen(!b2bDropdownOpen)}
                className={`whitespace-nowrap px-2.5 xl:px-3.5 py-1.5 rounded-full font-label-md text-[11px] xl:text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-1 font-bold cursor-pointer ${
                  pathname.startsWith("/b2b") || pathname.startsWith("/corporate-gifting")
                    ? "bg-amber-500/15 text-amber-950 font-extrabold border border-amber-500/40 shadow-xs"
                    : "text-[#4A3B28] hover:text-amber-900 hover:bg-[#FAF6EE]"
                }`}
              >
                <span>Corporate &amp; Bulk</span>
                <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                  B2B
                </span>
                <span
                  className={`material-symbols-outlined text-[15px] transition-transform duration-200 ${
                    b2bDropdownOpen ? "rotate-180" : ""
                  }`}
                >
                  keyboard_arrow_down
                </span>
              </button>

              {/* B2B DROPDOWN MENU */}
              {b2bDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[460px] bg-white rounded-3xl shadow-2xl border border-amber-900/15 p-4 animate-in fade-in zoom-in-95 duration-200 z-50">
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-amber-900/10">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#D84315] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">business</span>
                      <span>B2B &amp; Enterprise Solutions</span>
                    </span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-300 font-extrabold px-2 py-0.5 rounded-full">
                      100% GST ITC Invoices
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* Option 1: B2B Wholesale Portal */}
                    <Link
                      href="/b2b"
                      onClick={() => setB2bDropdownOpen(false)}
                      className="group flex items-start gap-3.5 p-3 rounded-2xl hover:bg-[#FAF6EE] border border-transparent hover:border-amber-900/15 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 group-hover:bg-[#D84315] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">store</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-headline-sm text-xs font-black text-amber-950 group-hover:text-[#D84315] transition-colors">
                            Wholesale &amp; Bulk Order Portal
                          </h4>
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                            Up to 35% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600 mt-0.5 leading-snug">
                          Multi-flavor bulk order sheet, automated tiered volume pricing, pallet freight &amp; GST tax invoices.
                        </p>
                      </div>
                    </Link>

                    {/* Option 2: Corporate & Festive Gifting */}
                    <Link
                      href="/corporate-gifting"
                      onClick={() => setB2bDropdownOpen(false)}
                      className="group flex items-start gap-3.5 p-3 rounded-2xl hover:bg-[#FAF6EE] border border-transparent hover:border-amber-900/15 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#D84315] group-hover:bg-[#D84315] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">redeem</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-headline-sm text-xs font-black text-amber-950 group-hover:text-[#D84315] transition-colors">
                            Corporate &amp; Festive Gifting
                          </h4>
                          <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                            Custom Hampers
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600 mt-0.5 leading-snug">
                          Customized luxury gift boxes, employee wellness packs, client appreciation &amp; custom logo sleeve branding.
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Quick WhatsApp B2B Help */}
                  <div className="mt-3 pt-2.5 border-t border-amber-900/10 flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500 font-medium">Direct B2B desk:</span>
                    <a
                      href="https://wa.me/916001684216?text=Namaste%2C%20I%20need%20assistance%20with%20Makhana%20Gold%20Corporate%20%26%20Wholesale%20procurement."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25D366] hover:underline font-bold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">chat</span>
                      <span>+91 60016 84216</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/blog"
              className={`whitespace-nowrap px-2.5 xl:px-3.5 py-1.5 rounded-full font-label-md text-[11px] xl:text-xs uppercase tracking-wider transition-all duration-200 font-bold ${
                pathname.startsWith("/blog")
                  ? "bg-amber-500/15 text-amber-950 font-extrabold border border-amber-500/40 shadow-xs"
                  : "text-[#4A3B28] hover:text-amber-900 hover:bg-[#FAF6EE]"
              }`}
            >
              Blog
            </Link>

            <Link
              href="/support"
              className={`whitespace-nowrap px-2.5 xl:px-3.5 py-1.5 rounded-full font-label-md text-[11px] xl:text-xs uppercase tracking-wider transition-all duration-200 font-bold ${
                pathname === "/support"
                  ? "bg-amber-500/15 text-amber-950 font-extrabold border border-amber-500/40 shadow-xs"
                  : "text-[#4A3B28] hover:text-amber-900 hover:bg-[#FAF6EE]"
              }`}
            >
              Support
            </Link>
          </nav>

          {/* Trailing Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Search Pill Trigger */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              aria-label="Search Collection"
              className="w-10 h-10 rounded-full bg-[#FAF6EE] hover:bg-amber-100/80 text-amber-900 border border-amber-900/10 transition-all flex items-center justify-center cursor-pointer shadow-xs hover:scale-105"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            {/* Account Icon */}
            <Link
              href={isLoggedIn ? "/account" : "/login"}
              aria-label={isLoggedIn ? "Account Dashboard" : "Customer Login"}
              className="w-10 h-10 rounded-full bg-[#FAF6EE] hover:bg-amber-100/80 text-amber-900 border border-amber-900/10 transition-all hidden sm:flex items-center justify-center cursor-pointer shadow-xs hover:scale-105"
            >
              {isLoggedIn && userName ? (
                <span className="font-bold text-xs text-amber-800 uppercase">
                  {userName.charAt(0)}
                </span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">person</span>
              )}
            </Link>

            {/* Cart Button with Glowing Badge */}
            <Link
              href="/cart"
              aria-label="Shopping Bag"
              className={`relative flex items-center gap-2 bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white px-3.5 sm:px-4 py-2 rounded-full transition-all shadow-vermillion-glow hover:scale-105 active:scale-95 cursor-pointer font-bold text-xs uppercase tracking-wider ${
                cartBump ? "ring-4 ring-amber-400/50" : ""
              }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] ${cartBump ? "animate-cart-bump" : ""}`}
              >
                shopping_bag
              </span>
              <span className="hidden sm:inline">Bag</span>
              {cartCount > 0 && (
                <span
                  key={cartCount}
                  className="bg-white text-[#D84315] text-[11px] font-extrabold h-5 min-w-5 px-1 rounded-full flex items-center justify-center shadow-xs animate-badge-pop"
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Live Search Modal */}
      <SearchModalClient
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* 📱 Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-white animate-in fade-in duration-200">
          <div className="flex justify-between items-center h-20 px-5 border-b border-amber-900/10">
            <div className="relative w-36 h-12">
              <Image
                src="/images/logo/logo.png"
                alt="Makhana Gold"
                fill
                sizes="144px"
                className="object-contain"
              />
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="p-2 text-amber-900 hover:bg-[#FAF6EE] rounded-xl"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>


          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Expandable Shop Section */}
            <div className="border border-amber-900/10 rounded-2xl overflow-hidden bg-[#FAF6EE]/50">
              <button
                onClick={() => setMobileShopExpanded(!mobileShopExpanded)}
                className="w-full p-4 flex items-center justify-between font-headline-sm text-base font-bold text-amber-950"
              >
                <span className="flex items-center gap-2">
                  <span>🛍️</span>
                  <span>Shop Superfoods</span>
                </span>
                <span className={`material-symbols-outlined transition-transform ${mobileShopExpanded ? "rotate-180" : ""}`}>
                  keyboard_arrow_down
                </span>
              </button>

              {mobileShopExpanded && (
                <div className="p-3 bg-white border-t border-amber-900/10 space-y-3">
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block p-2 rounded-xl bg-amber-50 text-xs font-black text-[#D84315]"
                  >
                    ✨ View All Superfoods (Complete Catalog) →
                  </Link>

                  {categoryTree.map((parent) => (
                    <div key={parent.slug} className="space-y-1">
                      <Link
                        href={`/shop?category=${parent.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-2 py-1 text-xs font-black text-amber-950"
                      >
                        {PILLAR_ICONS[parent.slug]} {parent.name}
                      </Link>
                      {parent.children.map((child) => (
                        <Link
                          key={child.slug}
                          href={`/shop?category=${child.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block pl-6 pr-2 py-1 text-[11px] text-neutral-600 hover:text-[#D84315]"
                        >
                          • {child.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-4 rounded-2xl bg-[#FAF6EE] text-amber-950 font-bold text-base"
            >
              📝 Blog
            </Link>

            <Link
              href="/our-story"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-4 rounded-2xl bg-[#FAF6EE] text-amber-950 font-bold text-base"
            >
              📖 Our Story
            </Link>

            <Link
              href="/offers"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-4 rounded-2xl bg-[#FAF6EE] text-amber-950 font-bold text-base flex items-center justify-between"
            >
              <span>🎁 Bundles &amp; Offers</span>
              <span className="bg-[#D84315] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                15% OFF
              </span>
            </Link>

            {/* Mobile Corporate & Bulk Accordion */}
            <div className="rounded-2xl border border-amber-900/15 overflow-hidden bg-[#FAF6EE]/50">
              <button
                type="button"
                onClick={() => setMobileB2bExpanded(!mobileB2bExpanded)}
                className="w-full p-4 text-left font-bold text-base text-amber-950 flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>🏢</span>
                  <span>Corporate &amp; Bulk (B2B)</span>
                </span>
                <span
                  className={`material-symbols-outlined transition-transform ${
                    mobileB2bExpanded ? "rotate-180" : ""
                  }`}
                >
                  keyboard_arrow_down
                </span>
              </button>

              {mobileB2bExpanded && (
                <div className="p-3 bg-white border-t border-amber-900/10 space-y-2">
                  <Link
                    href="/b2b"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block p-3 rounded-xl bg-amber-50/70 border border-amber-900/10 hover:bg-amber-100/60"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-black text-xs text-[#D84315]">
                        💼 B2B Wholesale Order Portal
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                        Up to 35% OFF
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600">
                      Multi-flavor order sheet &amp; automated wholesale volume slabs.
                    </p>
                  </Link>

                  <Link
                    href="/corporate-gifting"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block p-3 rounded-xl bg-amber-50/70 border border-amber-900/10 hover:bg-amber-100/60"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-black text-xs text-amber-950">
                        🎁 Corporate &amp; Festive Gifting
                      </span>
                      <span className="bg-amber-200 text-amber-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                        Custom RFQ
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600">
                      Customized luxury gift boxes &amp; employee wellness packs.
                    </p>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/support"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-4 rounded-2xl bg-[#FAF6EE] text-amber-950 font-bold text-base"
            >
              📞 Customer Care
            </Link>
          </div>

          <div className="p-5 border-t border-amber-900/10">
            {isLoggedIn ? (
              <div className="space-y-2">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-3 text-center bg-amber-950 text-white rounded-xl font-bold text-sm"
                >
                  My Account Dashboard
                </Link>
                <form action={customerLogoutAction}>
                  <button
                    type="submit"
                    className="w-full py-2 text-center text-red-600 text-xs font-bold"
                  >
                    Log Out
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-3 text-center bg-[#D84315] text-white rounded-xl font-bold text-sm shadow-warm-1"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
