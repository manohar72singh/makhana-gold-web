/**
 * Centralized SEO Utilities — Makhana Gold
 * Generates JSON-LD structured data for Google Rich Results
 */

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://makhanagold.com";
const SITE_NAME = "Makhana Gold";
const ORG_ID = `${SITE_URL}/#organization`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

// ---------------------------------------------------------------------------
// FAQ Page Schema — adds Google FAQ rich result (expandable dropdowns in SERP)
// ---------------------------------------------------------------------------

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// BreadcrumbList Schema — enables breadcrumb trail in Google SERP
// ---------------------------------------------------------------------------

export function generateBreadcrumbSchema(crumbs: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith("http") ? crumb.url : `${SITE_URL}${crumb.url}`,
    })),
  };
}

// ---------------------------------------------------------------------------
// Article / BlogPosting Schema — full enriched version
// ---------------------------------------------------------------------------

export function generateArticleSchema(blog: {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  authorName: string;
  authorRole?: string | null;
  category: string;
  tags?: string | null;
  createdAt: Date;
  updatedAt: Date;
  readingTimeMinutes?: number;
}) {
  const wordCount = blog.content.trim().split(/\s+/).length;
  const keywords = blog.tags ? blog.tags.split(",").map((t) => t.trim()) : [];

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/blog/${blog.slug}`,
    headline: blog.title,
    description: blog.excerpt || blog.title,
    image: blog.coverImage ? [`${SITE_URL}${blog.coverImage}`] : [`${SITE_URL}/images/vibrant/hero.jpg`],
    datePublished: blog.createdAt.toISOString(),
    dateModified: blog.updatedAt.toISOString(),
    wordCount,
    timeRequired: `PT${blog.readingTimeMinutes || Math.ceil(wordCount / 200)}M`,
    articleSection: blog.category,
    keywords: keywords.join(", "),
    author: {
      "@type": "Person",
      name: blog.authorName,
      jobTitle: blog.authorRole || "Nutritionist",
    },
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${blog.slug}`,
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["article h1", "article h2", ".article-excerpt"],
    },
    inLanguage: "en-IN",
    isPartOf: {
      "@type": "Blog",
      "@id": `${SITE_URL}/blog`,
      name: `${SITE_NAME} Superfoods Journal`,
    },
  };
}

// ---------------------------------------------------------------------------
// Product Schema — for ecommerce rich results
// ---------------------------------------------------------------------------

export function generateProductSchema(product: {
  name: string;
  slug: string;
  description?: string | null;
  image?: string;
  price: number;
  compareAtPrice?: number | null;
  sku?: string;
  availability: "InStock" | "OutOfStock" | "PreOrder";
  avgRating?: number;
  reviewCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} — Premium artisanal makhana from Makhana Gold`,
    image: product.image ? `${SITE_URL}${product.image}` : `${SITE_URL}/images/vibrant/hero.jpg`,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    manufacturer: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
    },
    url: `${SITE_URL}/product/${product.slug}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price.toFixed(2),
      ...(product.compareAtPrice && { priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] }),
      availability: `https://schema.org/${product.availability}`,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        "@id": ORG_ID,
        name: SITE_NAME,
      },
    },
    ...(product.avgRating && product.reviewCount && product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.avgRating.toFixed(1),
            reviewCount: product.reviewCount,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// CollectionPage Schema — for blog listing, shop listing pages
// ---------------------------------------------------------------------------

export function generateCollectionPageSchema(opts: {
  name: string;
  description: string;
  url: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`,
    ...(opts.image && { image: opts.image }),
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
    },
    inLanguage: "en-IN",
  };
}

// ---------------------------------------------------------------------------
// WebPage Schema — for static pages
// ---------------------------------------------------------------------------

export function generateWebPageSchema(opts: {
  name: string;
  description: string;
  url: string;
  breadcrumbs?: BreadcrumbItem[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.name,
    description: opts.description,
    url: opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`,
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
    },
    inLanguage: "en-IN",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
    },
  };
}

// ---------------------------------------------------------------------------
// Canonical URL Helper
// ---------------------------------------------------------------------------

export function getCanonicalUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// ---------------------------------------------------------------------------
// Default Blog FAQs — fallback for individual blog posts that don't have
// their own custom FAQ set filled in via the admin blog editor.
// ---------------------------------------------------------------------------

export const DEFAULT_BLOG_FAQS: FAQItem[] = [
  {
    question: "Is makhana (fox nuts) good for weight loss?",
    answer:
      "Yes, makhana is excellent for weight management. At only 347 kcal per 100g with 9.7g protein, 14.5g dietary fibre, and a very low glycaemic index, makhana keeps you full longer, reduces cravings, and prevents blood sugar spikes. It is a scientifically validated low-calorie, high-satiety superfood.",
  },
  {
    question: "Can diabetics eat makhana daily?",
    answer:
      "Yes. Makhana has a low glycaemic index (GI ~50) which means it causes a slow, steady rise in blood sugar compared to other snacks. Its high magnesium content also supports insulin sensitivity. Most nutritionists recommend 20–30g of roasted makhana as an ideal mid-meal snack for Type 2 diabetics.",
  },
  {
    question: "What is the best time to eat makhana?",
    answer:
      "Makhana is best consumed as a mid-morning or evening snack (10:30 AM or 4–5 PM). Eating it 30–60 minutes before meals can help control portion size. For athletes, consuming makhana post-workout provides a light protein boost without excess fat. Avoid eating large quantities right before bedtime.",
  },
];
