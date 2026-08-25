import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

// Site-wide content (categories, settings, banners, etc.) rarely changes.
// Cache across requests so normal traffic doesn't re-query the DB pool
// (limit=5) on every single page load — only React-request-dedupe via
// `cache()` alone was hitting the DB on every visit.
const CONTENT_REVALIDATE_SECONDS = 60;

export interface HeroSlideData {
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

export interface TrustBadgeData {
  icon: string;
  color: string;
  title: string;
  description: string;
}

export interface HealthBenefitData {
  title: string;
  value: string;
  description: string;
  icon: string;
  accent: string;
}

export interface FaqCategoryData {
  category: string;
  items: { q: string; a: string }[];
}

export interface MarketplaceLinkData {
  id: string;
  name: string;
  platformKey: string;
  url: string;
  badgeText?: string | null;
  borderHover?: string | null;
}

/**
 * Fetch all active Hero Banners from the database.
 */
export const getHeroBanners = cache(unstable_cache(async function getHeroBanners(): Promise<HeroSlideData[]> {
  try {
    if (!prisma.heroBanner) return [];
    const banners = await prisma.heroBanner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (!banners || banners.length === 0) return [];

    return banners.map((b) => ({
      id: b.slideKey,
      badge: b.badge,
      badgeColor: b.badgeColor || undefined,
      title: b.title,
      highlightTitle: b.highlightTitle,
      description: b.description,
      ctaText: b.ctaText,
      ctaLink: b.ctaLink,
      secondaryCtaText: b.secondaryCtaText || undefined,
      secondaryCtaLink: b.secondaryCtaLink || undefined,
      bgImage: b.bgImage,
      theme: (b.theme === "dark" ? "dark" : "light") as "light" | "dark",
      socialProof: b.socialProof || undefined,
      showMarketplaceLogos: b.showMarketplaces,
    }));
  } catch (error) {
    console.error("Error fetching hero banners:", error);
    return [];
  }
}, ["hero-banners"], { revalidate: CONTENT_REVALIDATE_SECONDS }));

/**
 * Fetch Trust Badges & Health Benefits from feature pillars table.
 */
export const getTrustBadges = cache(unstable_cache(async function getTrustBadges(): Promise<TrustBadgeData[]> {
  try {
    if (!prisma.featurePillar) return [];
    const items = await prisma.featurePillar.findMany({
      where: { isActive: true, section: "trust_badge" },
      orderBy: { sortOrder: "asc" },
    });

    if (!items) return [];

    return items.map((item) => ({
      icon: item.icon,
      color: item.accentColor || "bg-amber-500/15 text-emerald-700",
      title: item.title,
      description: item.description,
    }));
  } catch (error) {
    console.error("Error fetching trust badges:", error);
    return [];
  }
}, ["trust-badges"], { revalidate: CONTENT_REVALIDATE_SECONDS }));

export const getHealthBenefits = cache(unstable_cache(async function getHealthBenefits(): Promise<HealthBenefitData[]> {
  try {
    if (!prisma.featurePillar) return [];
    const items = await prisma.featurePillar.findMany({
      where: { isActive: true, section: "health_benefit" },
      orderBy: { sortOrder: "asc" },
    });

    if (!items) return [];

    return items.map((item) => ({
      title: item.title,
      value: item.value || "Superfood",
      description: item.description,
      icon: item.icon,
      accent: item.accentColor || "from-amber-500/20 to-orange-500/10 text-amber-800",
    }));
  } catch (error) {
    console.error("Error fetching health benefits:", error);
    return [];
  }
}, ["health-benefits"], { revalidate: CONTENT_REVALIDATE_SECONDS }));

/**
 * Fetch all active FAQs grouped by category from the database.
 */
export const getFaqCategories = cache(unstable_cache(async function getFaqCategories(): Promise<FaqCategoryData[]> {
  try {
    if (!prisma.faqItem) return [];
    const faqs = await prisma.faqItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });

    if (!faqs || faqs.length === 0) return [];

    const groups: Record<string, { q: string; a: string }[]> = {};
    for (const faq of faqs) {
      if (!groups[faq.category]) {
        groups[faq.category] = [];
      }
      groups[faq.category].push({
        q: faq.question,
        a: faq.answer,
      });
    }

    return Object.entries(groups).map(([category, items]) => ({
      category,
      items,
    }));
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
}, ["faq-categories"], { revalidate: CONTENT_REVALIDATE_SECONDS }));

/**
 * Fetch all active Marketplace Quick-Commerce links from the database.
 */
export const getMarketplaceLinks = cache(unstable_cache(async function getMarketplaceLinks(): Promise<MarketplaceLinkData[]> {
  try {
    if (!prisma.marketplaceLink) return [];
    const links = await prisma.marketplaceLink.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (!links || links.length === 0) return [];

    return links.map((l) => ({
      id: l.platformKey,
      name: l.name,
      platformKey: l.platformKey,
      url: l.url,
      badgeText: l.badgeText,
      borderHover: l.borderHover,
    }));
  } catch (error) {
    console.error("Error fetching marketplace links:", error);
    return [];
  }
}, ["marketplace-links"], { revalidate: CONTENT_REVALIDATE_SECONDS }));

/**
 * Fetch key-value Site Settings from the database.
 */
export const getSiteSettings = cache(unstable_cache(async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    if (!prisma.siteSetting) return {};
    const settings = await prisma.siteSetting.findMany({});
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return map;
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return {};
  }
}, ["site-settings"], { revalidate: CONTENT_REVALIDATE_SECONDS }));

/**
 * Fetch approved customer reviews from the database for the storefront.
 */
export const getStorefrontReviews = cache(unstable_cache(async function getStorefrontReviews() {
  try {
    if (!prisma.review) return [];
    return await prisma.review.findMany({
      where: { isApproved: true },
      include: {
        customer: {
          select: { name: true },
        },
        product: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}, ["storefront-reviews"], { revalidate: CONTENT_REVALIDATE_SECONDS }));

/**
 * Fetch the top-level category tree (with children) used in site navigation.
 */
export const getCategoryTree = cache(unstable_cache(async function getCategoryTree() {
  try {
    if (!prisma.category) return [];
    return await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: { orderBy: { name: "asc" } },
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching categories in SiteHeader:", error);
    return [];
  }
}, ["category-tree"], { revalidate: CONTENT_REVALIDATE_SECONDS }));
