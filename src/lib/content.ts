import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

// Site-wide content (categories, settings, banners, etc.) rarely changes.
// Cache across requests for high throughput and reduced DB load.
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

// Built-in Default Fallbacks (Ensures 100% Storefront Uptime during DB maintenance/cold starts)
const DEFAULT_HERO_BANNERS: HeroSlideData[] = [
  {
    id: "wetland-harvest",
    badge: "Direct from Mithila Wetlands",
    title: "Pure Wetland Harvest.",
    highlightTitle: "Artisanal Slow-Roasted Fox Nuts.",
    description: "100% organic, non-GMO, hand-plucked lotus seeds from the mineral-rich waters of Bihar. High protein, zero palm oil.",
    ctaText: "Shop Collection",
    ctaLink: "/shop",
    bgImage: "/images/vibrant/hero.jpg",
    theme: "light",
    socialProof: "★ 4.9/5 from 1,200+ Verified Buyers",
    showMarketplaceLogos: true,
  },
  {
    id: "himalayan-salt",
    badge: "Chef's Secret Recipe",
    title: "Himalayan Pink Salt.",
    highlightTitle: "Pure Crunch, Zero Guilt.",
    description: "Slow dry-roasted to golden crispness with authentic pink mineral salt from the Himalayan foothills.",
    ctaText: "Discover Flavour",
    ctaLink: "/shop",
    bgImage: "/images/vibrant/wetlands.jpg",
    theme: "light",
    showMarketplaceLogos: true,
  },
];

const DEFAULT_TRUST_BADGES: TrustBadgeData[] = [
  {
    icon: "verified_user",
    color: "bg-amber-500/15 text-emerald-700",
    title: "100% Wetland Harvested",
    description: "Direct from certified Bihar ponds",
  },
  {
    icon: "eco",
    color: "bg-emerald-500/15 text-emerald-700",
    title: "Zero Palm Oil or MSG",
    description: "Only slow dry-roasted goodness",
  },
  {
    icon: "local_shipping",
    color: "bg-blue-500/15 text-blue-700",
    title: "Fast Pan-India Express",
    description: "Dispatched within 24 hours",
  },
  {
    icon: "workspace_premium",
    color: "bg-purple-500/15 text-purple-700",
    title: "FSSAI & Lab Certified",
    description: "100% natural, chemical-free",
  },
];

const DEFAULT_HEALTH_BENEFITS: HealthBenefitData[] = [
  {
    title: "High Plant Protein",
    value: "16g / 100g",
    description: "Essential amino acids for muscle recovery and daily vitality.",
    icon: "fitness_center",
    accent: "from-amber-500/20 to-orange-500/10 text-amber-800",
  },
  {
    title: "Low Glycemic Index",
    value: "Low GI Rating",
    description: "Sustained clean energy without sugar spikes — ideal for diabetic diets.",
    icon: "bloodtype",
    accent: "from-emerald-500/20 to-teal-500/10 text-emerald-800",
  },
  {
    title: "Cardio Protective",
    value: "High Magnesium",
    description: "Rich in potassium and magnesium to support heart health and blood pressure.",
    icon: "favorite",
    accent: "from-rose-500/20 to-pink-500/10 text-rose-800",
  },
  {
    title: "Gluten-Free & Vegan",
    value: "Clean Superfood",
    description: "Naturally gluten-free, anti-inflammatory superfood suitable for all dietary lifestyles.",
    icon: "spa",
    accent: "from-amber-500/20 to-yellow-500/10 text-amber-900",
  },
];

const DEFAULT_MARKETPLACE_LINKS: MarketplaceLinkData[] = [
  { id: "amazon", name: "Amazon Prime", platformKey: "amazon", url: "https://amazon.in/s?k=Makhana+Gold", badgeText: "Prime 1-Day" },
  { id: "flipkart", name: "Flipkart Assured", platformKey: "flipkart", url: "https://flipkart.com/search?q=Makhana+Gold", badgeText: "Assured" },
  { id: "blinkit", name: "Blinkit", platformKey: "blinkit", url: "https://blinkit.com", badgeText: "10 Mins" },
  { id: "zepto", name: "Zepto", platformKey: "zepto", url: "https://zeptonow.com", badgeText: "10 Mins" },
  { id: "swiggy", name: "Swiggy Instamart", platformKey: "swiggy", url: "https://swiggy.com/instamart", badgeText: "Instant" },
];

const DEFAULT_SITE_SETTINGS: Record<string, string> = {
  store_name: "Makhana Gold",
  support_phone: "+916001684216",
  support_whatsapp: "916001684216",
  support_email: "mmakhanaltd@gmail.com",
  announcement_enabled: "true",
  announcement_badge: "Special Privilege:",
  announcement_text: "Get 15% OFF your first harvest",
  announcement_coupon: "GOLDEN15",
  announcement_shipping_text: "🚚 Free Shipping on Orders ₹500+",
  iso_certified_text: "ISO 22000 & 9001 Certified",
};

/**
 * Fetch all active Hero Banners from the database.
 */
export const getHeroBanners = cache(unstable_cache(async function getHeroBanners(): Promise<HeroSlideData[]> {
  try {
    if (!prisma.heroBanner) return DEFAULT_HERO_BANNERS;
    const banners = await prisma.heroBanner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (!banners || banners.length === 0) return DEFAULT_HERO_BANNERS;

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
    console.error("[content] Error fetching hero banners, using default fallbacks:", error);
    return DEFAULT_HERO_BANNERS;
  }
}, ["hero-banners"], { revalidate: CONTENT_REVALIDATE_SECONDS }));

/**
 * Fetch Trust Badges & Health Benefits from feature pillars table.
 */
export const getTrustBadges = cache(unstable_cache(async function getTrustBadges(): Promise<TrustBadgeData[]> {
  try {
    if (!prisma.featurePillar) return DEFAULT_TRUST_BADGES;
    const items = await prisma.featurePillar.findMany({
      where: { isActive: true, section: "trust_badge" },
      orderBy: { sortOrder: "asc" },
    });

    if (!items || items.length === 0) return DEFAULT_TRUST_BADGES;

    return items.map((item) => ({
      icon: item.icon,
      color: item.accentColor || "bg-amber-500/15 text-emerald-700",
      title: item.title,
      description: item.description,
    }));
  } catch (error) {
    console.error("[content] Error fetching trust badges, using default fallbacks:", error);
    return DEFAULT_TRUST_BADGES;
  }
}, ["trust-badges"], { revalidate: CONTENT_REVALIDATE_SECONDS }));

export const getHealthBenefits = cache(unstable_cache(async function getHealthBenefits(): Promise<HealthBenefitData[]> {
  try {
    if (!prisma.featurePillar) return DEFAULT_HEALTH_BENEFITS;
    const items = await prisma.featurePillar.findMany({
      where: { isActive: true, section: "health_benefit" },
      orderBy: { sortOrder: "asc" },
    });

    if (!items || items.length === 0) return DEFAULT_HEALTH_BENEFITS;

    return items.map((item) => ({
      title: item.title,
      value: item.value || "Superfood",
      description: item.description,
      icon: item.icon,
      accent: item.accentColor || "from-amber-500/20 to-orange-500/10 text-amber-800",
    }));
  } catch (error) {
    console.error("[content] Error fetching health benefits, using default fallbacks:", error);
    return DEFAULT_HEALTH_BENEFITS;
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
    console.error("[content] Error fetching FAQs:", error);
    return [];
  }
}, ["faq-categories"], { revalidate: CONTENT_REVALIDATE_SECONDS }));

/**
 * Fetch all active Marketplace Quick-Commerce links from the database.
 */
export const getMarketplaceLinks = cache(unstable_cache(async function getMarketplaceLinks(): Promise<MarketplaceLinkData[]> {
  try {
    if (!prisma.marketplaceLink) return DEFAULT_MARKETPLACE_LINKS;
    const links = await prisma.marketplaceLink.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (!links || links.length === 0) return DEFAULT_MARKETPLACE_LINKS;

    return links.map((l) => ({
      id: l.platformKey,
      name: l.name,
      platformKey: l.platformKey,
      url: l.url,
      badgeText: l.badgeText,
      borderHover: l.borderHover,
    }));
  } catch (error) {
    console.error("[content] Error fetching marketplace links, using default fallbacks:", error);
    return DEFAULT_MARKETPLACE_LINKS;
  }
}, ["marketplace-links"], { revalidate: CONTENT_REVALIDATE_SECONDS }));

/**
 * Fetch key-value Site Settings from the database.
 */
export const getSiteSettings = cache(unstable_cache(async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    if (!prisma.siteSetting) return DEFAULT_SITE_SETTINGS;
    const settings = await prisma.siteSetting.findMany({});
    const map: Record<string, string> = { ...DEFAULT_SITE_SETTINGS };
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return map;
  } catch (error) {
    console.error("[content] Error fetching site settings, using default fallbacks:", error);
    return DEFAULT_SITE_SETTINGS;
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
    console.error("[content] Error fetching reviews:", error);
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
    console.error("[content] Error fetching categories in SiteHeader:", error);
    return [];
  }
}, ["category-tree"], { revalidate: CONTENT_REVALIDATE_SECONDS }));

