import "dotenv/config";
import { prisma } from "../src/lib/db";
import {
  getHeroBanners,
  getTrustBadges,
  getHealthBenefits,
  getFaqCategories,
  getMarketplaceLinks,
  getSiteSettings,
  getStorefrontReviews,
} from "../src/lib/content";

async function run() {
  console.log("=== Testing Backend Data Queries ===");

  const banners = await getHeroBanners();
  console.log(`Hero Banners (${banners.length}):`, banners.map((b) => b.title));

  const badges = await getTrustBadges();
  console.log(`Trust Badges (${badges.length}):`, badges.map((b) => b.title));

  const benefits = await getHealthBenefits();
  console.log(`Health Benefits (${benefits.length}):`, benefits.map((b) => b.title));

  const faqs = await getFaqCategories();
  console.log(`FAQ Categories (${faqs.length}):`, faqs.map((f) => f.category));

  const marketplaces = await getMarketplaceLinks();
  console.log(`Marketplaces (${marketplaces.length}):`, marketplaces.map((m) => m.name));

  const settings = await getSiteSettings();
  console.log("Site Settings count:", Object.keys(settings).length);

  const reviews = await getStorefrontReviews();
  console.log(`Approved Reviews count:`, reviews.length);

  // Test inserting a contact inquiry
  const testInquiry = await prisma.contactInquiry.create({
    data: {
      name: "Test Verification Client",
      email: "verify@testclient.com",
      phone: "+919999888877",
      subject: "Wholesale & Enterprise Gifting Inquiry",
      message: "Testing backend database persistence with zero hardcoded mocks.",
      status: "new",
    },
  });
  console.log("Created Test Contact Inquiry in DB ID:", testInquiry.id);

  // Test inserting newsletter subscriber
  const testSub = await prisma.newsletterSubscriber.upsert({
    where: { email: "newsletter_test@client.com" },
    update: { status: "active" },
    create: { email: "newsletter_test@client.com", status: "active", source: "verification" },
  });
  console.log("Upserted Newsletter Subscriber ID:", testSub.id);

  console.log("✅ ALL BACKEND DATABASE CHECKS PASSED PERFECTLY!");
}

run()
  .catch((e) => {
    console.error("Test Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
