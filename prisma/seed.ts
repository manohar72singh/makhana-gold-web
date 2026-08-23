import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function ensureTablesExist() {
  const ddlStatements = [
    `CREATE TABLE IF NOT EXISTS \`hero_banners\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`slide_key\` VARCHAR(191) NOT NULL,
      \`badge\` VARCHAR(255) NOT NULL,
      \`badge_color\` VARCHAR(255) NULL,
      \`title\` VARCHAR(255) NOT NULL,
      \`highlight_title\` VARCHAR(255) NOT NULL,
      \`description\` TEXT NOT NULL,
      \`cta_text\` VARCHAR(255) NOT NULL,
      \`cta_link\` VARCHAR(255) NOT NULL,
      \`secondary_cta_text\` VARCHAR(255) NULL,
      \`secondary_cta_link\` VARCHAR(255) NULL,
      \`bg_image\` VARCHAR(500) NOT NULL,
      \`theme\` VARCHAR(50) NOT NULL DEFAULT 'light',
      \`social_proof\` VARCHAR(255) NULL,
      \`show_marketplaces\` BOOLEAN NOT NULL DEFAULT FALSE,
      \`sort_order\` INT NOT NULL DEFAULT 0,
      \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
      \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`hero_banners_slide_key_unique\` (\`slide_key\`),
      INDEX \`hero_banners_is_active_sort_order_idx\` (\`is_active\`, \`sort_order\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`faq_items\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`category\` VARCHAR(191) NOT NULL,
      \`question\` TEXT NOT NULL,
      \`answer\` TEXT NOT NULL,
      \`sort_order\` INT NOT NULL DEFAULT 0,
      \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
      \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      INDEX \`faq_items_is_active_category_sort_order_idx\` (\`is_active\`, \`category\`, \`sort_order\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`feature_pillars\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`section\` VARCHAR(100) NOT NULL,
      \`title\` VARCHAR(255) NOT NULL,
      \`value\` VARCHAR(100) NULL,
      \`description\` TEXT NOT NULL,
      \`icon\` VARCHAR(100) NOT NULL,
      \`accent_color\` VARCHAR(255) NULL,
      \`sort_order\` INT NOT NULL DEFAULT 0,
      \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
      \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      INDEX \`feature_pillars_is_active_section_sort_order_idx\` (\`is_active\`, \`section\`, \`sort_order\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`marketplace_links\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`name\` VARCHAR(191) NOT NULL,
      \`platform_key\` VARCHAR(191) NOT NULL,
      \`url\` VARCHAR(500) NOT NULL,
      \`badge_text\` VARCHAR(255) NULL,
      \`border_hover\` VARCHAR(255) NULL,
      \`sort_order\` INT NOT NULL DEFAULT 0,
      \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
      \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`marketplace_links_platform_key_unique\` (\`platform_key\`),
      INDEX \`marketplace_links_is_active_sort_order_idx\` (\`is_active\`, \`sort_order\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`contact_inquiries\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`name\` VARCHAR(255) NOT NULL,
      \`email\` VARCHAR(191) NOT NULL,
      \`phone\` VARCHAR(100) NULL,
      \`subject\` VARCHAR(255) NOT NULL,
      \`message\` TEXT NOT NULL,
      \`status\` VARCHAR(50) NOT NULL DEFAULT 'new',
      \`admin_notes\` TEXT NULL,
      \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`resolved_at\` DATETIME(3) NULL,
      PRIMARY KEY (\`id\`),
      INDEX \`contact_inquiries_status_created_at_idx\` (\`status\`, \`created_at\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`newsletter_subscribers\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`email\` VARCHAR(191) NOT NULL,
      \`status\` VARCHAR(50) NOT NULL DEFAULT 'active',
      \`source\` VARCHAR(50) NOT NULL DEFAULT 'footer',
      \`coupon_sent\` VARCHAR(50) NULL,
      \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`newsletter_subscribers_email_unique\` (\`email\`),
      INDEX \`newsletter_subscribers_status_created_at_idx\` (\`status\`, \`created_at\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`site_settings\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`key\` VARCHAR(191) NOT NULL,
      \`value\` TEXT NOT NULL,
      \`description\` VARCHAR(255) NULL,
      \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`site_settings_key_unique\` (\`key\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
  ];

  for (const sql of ddlStatements) {
    await prisma.$executeRawUnsafe(sql);
  }
}

async function syncProductImages(
  productId: number,
  images: { url: string; altText: string; isPrimary?: boolean; sortOrder: number }[]
) {
  await prisma.productImage.deleteMany({ where: { productId } });
  await prisma.productImage.createMany({
    data: images.map((img) => ({ ...img, productId, isPrimary: img.isPrimary ?? false })),
  });
}

async function main() {
  console.log("Ensuring all enterprise tables exist...");
  await ensureTablesExist();

  // 1. Categories
  const roasted = await prisma.category.upsert({
    where: { slug: "roasted-makhana" },
    update: {},
    create: { name: "Roasted Makhana", slug: "roasted-makhana" },
  });

  const flavoured = await prisma.category.upsert({
    where: { slug: "flavoured-makhana" },
    update: {},
    create: { name: "Flavoured Makhana", slug: "flavoured-makhana" },
  });

  // 2. Warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { id: 1 },
    update: {},
    create: { name: "Primary Warehouse", city: "Delhi", state: "Delhi" },
  });

  // 3. Products
  const himalayan = await prisma.product.upsert({
    where: { slug: "himalayan-pink-salt-makhana" },
    update: {},
    create: {
      name: "Himalayan Pink Salt Makhana",
      slug: "himalayan-pink-salt-makhana",
      description:
        "Premium foxnuts roasted to a light crunch and finished with authentic Himalayan pink salt.",
      categoryId: roasted.id,
      status: "active",
      variants: {
        create: [
          { sku: "MK-HPS-100", packSize: "100g", price: 249, weightGrams: 100 },
          { sku: "MK-HPS-250", packSize: "250g", price: 549, weightGrams: 250 },
          { sku: "MK-HPS-500", packSize: "500g", price: 999, weightGrams: 500 },
        ],
      },
    },
    include: { variants: true },
  });
  await syncProductImages(himalayan.id, [
    {
      url: "/images/products/himalayan-pink-salt.jpg",
      altText: "Himalayan Pink Salt Makhana pouch with golden roasted fox nuts",
      isPrimary: true,
      sortOrder: 0,
    },
    {
      url: "/images/vibrant/pink-salt.jpg",
      altText: "Himalayan Pink Salt Makhana in a bowl",
      sortOrder: 1,
    },
  ]);

  const truffle = await prisma.product.upsert({
    where: { slug: "truffle-parmesan-makhana" },
    update: {},
    create: {
      name: "Truffle & Parmesan Makhana",
      slug: "truffle-parmesan-makhana",
      description: "Dark, sophisticated flavoured makhana with truffle and parmesan notes.",
      categoryId: flavoured.id,
      status: "active",
      variants: {
        create: [
          { sku: "MK-TRF-100", packSize: "100g", price: 299, weightGrams: 100 },
          { sku: "MK-TRF-150", packSize: "150g", price: 399, weightGrams: 150 },
        ],
      },
    },
    include: { variants: true },
  });
  await syncProductImages(truffle.id, [
    {
      url: "/images/products/truffle-parmesan.jpg",
      altText: "Truffle & Parmesan Makhana luxury pouch",
      isPrimary: true,
      sortOrder: 0,
    },
    {
      url: "/images/vibrant/truffle.jpg",
      altText: "Truffle & Parmesan Makhana in a bowl",
      sortOrder: 1,
    },
  ]);

  const periPeri = await prisma.product.upsert({
    where: { slug: "peri-peri-makhana" },
    update: {},
    create: {
      name: "Peri Peri Zesty Makhana",
      slug: "peri-peri-makhana",
      description: "A fiery kick wrapped in a satisfying crunch — bold peri peri seasoning.",
      categoryId: flavoured.id,
      status: "active",
      variants: {
        create: [
          { sku: "MK-PPR-100", packSize: "100g", price: 279, weightGrams: 100 },
          { sku: "MK-PPR-250", packSize: "250g", price: 599, weightGrams: 250 },
        ],
      },
    },
    include: { variants: true },
  });
  await syncProductImages(periPeri.id, [
    {
      url: "/images/products/peri-peri.jpg",
      altText: "Peri Peri Zesty Makhana fiery pouch",
      isPrimary: true,
      sortOrder: 0,
    },
    {
      url: "/images/vibrant/peri-peri.jpg",
      altText: "Peri Peri Makhana in a bowl",
      sortOrder: 1,
    },
  ]);

  const heritageBundle = await prisma.product.upsert({
    where: { slug: "heritage-bundle" },
    update: {},
    create: {
      name: "The Heritage Bundle",
      slug: "heritage-bundle",
      description: "Experience our entire artisanal collection in one premium gift box.",
      categoryId: roasted.id,
      status: "active",
      variants: {
        create: [{ sku: "MK-BUNDLE-01", packSize: "Gift Box", price: 999 }],
      },
    },
    include: { variants: true },
  });
  await syncProductImages(heritageBundle.id, [
    {
      url: "/images/products/heritage-bundle.jpg",
      altText: "The Heritage Bundle luxury gift box",
      isPrimary: true,
      sortOrder: 0,
    },
  ]);

  // Inventory Stock
  for (const product of [himalayan, truffle, periPeri, heritageBundle]) {
    for (const variant of product.variants) {
      await prisma.inventoryStock.upsert({
        where: { variantId_warehouseId: { variantId: variant.id, warehouseId: warehouse.id } },
        update: {},
        create: {
          variantId: variant.id,
          warehouseId: warehouse.id,
          quantityOnHand: 500,
          quantityReserved: 0,
          reorderThreshold: 50,
        },
      });
    }
  }

  for (const [productId, key, value] of [
    [himalayan.id, "best_seller", "true"],
    [heritageBundle.id, "new", "true"],
  ] as const) {
    const exists = await prisma.productAttribute.findFirst({ where: { productId, key } });
    if (!exists) {
      await prisma.productAttribute.create({ data: { productId, key, value } });
    }
  }

  // 4. Coupons
  await prisma.coupon.upsert({
    where: { code: "GOLDEN15" },
    update: {},
    create: { code: "GOLDEN15", type: "percent", value: 15, minOrderValue: 0, isActive: true },
  });
  await prisma.coupon.upsert({
    where: { code: "FREESHIP" },
    update: {},
    create: { code: "FREESHIP", type: "fixed", value: 60, minOrderValue: 300, isActive: true },
  });

  // 5. Admin Role & User
  const superAdminRole = await prisma.adminRole.upsert({
    where: { name: "super_admin" },
    update: {},
    create: { name: "super_admin", permissions: { all: true } },
  });

  const adminPasswordHash = await bcrypt.hash("Admin@12345", 10);
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@makhanagold.test" },
    update: {},
    create: {
      email: "admin@makhanagold.test",
      passwordHash: adminPasswordHash,
      name: "Store Admin",
      roleId: superAdminRole.id,
    },
  });

  // 6. Customers
  const customerPasswordHash = await bcrypt.hash("Customer@12345", 10);
  const customer = await prisma.customer.upsert({
    where: { email: "customer@makhanagold.test" },
    update: {},
    create: {
      email: "customer@makhanagold.test",
      passwordHash: customerPasswordHash,
      name: "Dr. Ananya Sharma",
      phone: "+919876543210",
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { email: "vikram@makhanagold.test" },
    update: {},
    create: {
      email: "vikram@makhanagold.test",
      passwordHash: customerPasswordHash,
      name: "Vikramaditya Roy",
      phone: "+919811223344",
    },
  });

  const customer3 = await prisma.customer.upsert({
    where: { email: "meera@makhanagold.test" },
    update: {},
    create: {
      email: "meera@makhanagold.test",
      passwordHash: customerPasswordHash,
      name: "Meera Sen",
      phone: "+919822334455",
    },
  });

  // 7. Reviews
  const reviewsData = [
    {
      productId: himalayan.id,
      customerId: customer.id,
      rating: 5,
      title: "Cleanest, crispiest makhana I've ever experienced",
      body: "As a clinical nutritionist, I examine ingredients strictly. The pure mineral balance of Himalayan pink salt and cast iron slow-roasting makes this an everyday staple in our home.",
    },
    {
      productId: himalayan.id,
      customerId: customer2.id,
      rating: 5,
      title: "Zero oily aftertaste — truly jumbo pearls!",
      body: "Unlike typical store-bought brands that leave oil on fingers, these are completely dry-roasted with the crunch intact. Will definitely subscribe monthly.",
    },
    {
      productId: truffle.id,
      customerId: customer3.id,
      rating: 5,
      title: "Gourmet perfection — feels like dining in a luxury lounge",
      body: "The truffle aroma when opening the foil pouch is intoxicating. Savoury, aromatic, and perfectly seasoned. Pairs exquisitely with sparkling wine.",
    },
    {
      productId: periPeri.id,
      customerId: customer2.id,
      rating: 5,
      title: "Unbeatable smoky heat and zing!",
      body: "Just the right level of peri peri kick without overwhelming the natural sweetness of fox nuts. Replaced all our evening potato chips.",
    },
    {
      productId: heritageBundle.id,
      customerId: customer3.id,
      rating: 5,
      title: "The most luxurious gift hamper we gifted this season",
      body: "The packaging box is artwork. Arrived in pristine condition with 4 signature tins. Everyone in our family adored the diverse flavors.",
    },
  ];

  for (const r of reviewsData) {
    const existing = await prisma.review.findFirst({
      where: { productId: r.productId, customerId: r.customerId },
    });
    if (!existing) {
      await prisma.review.create({
        data: {
          productId: r.productId,
          customerId: r.customerId,
          rating: r.rating,
          title: r.title,
          body: r.body,
          isApproved: true,
        },
      });
    }
  }

  // 8. Dynamic Hero Banners (Backend Driven)
  const heroBannersData = [
    {
      slideKey: "signature-harvest",
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
      showMarketplaces: false,
      sortOrder: 0,
      isActive: true,
    },
    {
      slideKey: "marketplace-availability",
      badge: "🚀 NATIONWIDE AVAILABILITY • Amazon • Flipkart • Blinkit • Zepto",
      badgeColor: "bg-amber-500/25 border-amber-400/50 text-amber-300",
      title: "Order Makhana Gold On",
      highlightTitle: "India's Top Apps.",
      description:
        "Get authentic slow-roasted Bihar fox nuts on Amazon Prime, Flipkart Assured, Blinkit (10 mins), Zepto, and Instamart. Or order directly from our flagship store for 15% off!",
      ctaText: "Shop Flagship (15% Off)",
      ctaLink: "/shop",
      bgImage: "/images/banners/marketplace_bottom_banner.jpg",
      theme: "dark",
      socialProof: "⚡ 1-Day Prime Delivery • 10-Min Quick Commerce • 100% Certified Origin",
      showMarketplaces: true,
      sortOrder: 1,
      isActive: true,
    },
    {
      slideKey: "new-launch-truffle",
      badge: "🔥 NEW LAUNCH • Limited Reserve Edition",
      badgeColor: "bg-amber-500/25 border-amber-400/50 text-amber-300",
      title: "Black Truffle & Aged Herb.",
      highlightTitle: "Gourmet Elegance.",
      description:
        "Infused with Italian black summer truffle glaze, pure cold-pressed oils, and sea salt crystals. An unprecedented culinary experience crafted for the true connoisseur.",
      ctaText: "Explore New Launch (15% Off)",
      ctaLink: "/product/truffle-parmesan-makhana",
      secondaryCtaText: "View All Flavours",
      secondaryCtaLink: "/shop",
      bgImage: "/images/vibrant/new-launch.jpg",
      theme: "dark",
      socialProof: "⚡ Limited First Batch: Only 500 Tins Hand-Packed at Origin",
      showMarketplaces: false,
      sortOrder: 2,
      isActive: true,
    },
    {
      slideKey: "festive-heritage-gift",
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
      showMarketplaces: false,
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const b of heroBannersData) {
    await prisma.heroBanner.upsert({
      where: { slideKey: b.slideKey },
      update: b,
      create: b,
    });
  }

  // 9. Feature Pillars (Trust Badges + Health Benefits + Process Pillars)
  const pillarsData = [
    // Trust Badges
    {
      section: "trust_badge",
      title: "100% Organic & Clean",
      value: null,
      description: "Harvested directly from certified wetland lotus ponds in Bihar.",
      icon: "eco",
      accentColor: "bg-emerald-500/15 text-emerald-700",
      sortOrder: 0,
      isActive: true,
    },
    {
      section: "trust_badge",
      title: "Artisanal Slow Roast",
      value: null,
      description: "Slow dry-roasted in cast iron to preserve crunch and vital nutrients.",
      icon: "local_fire_department",
      accentColor: "bg-orange-500/15 text-orange-700",
      sortOrder: 1,
      isActive: true,
    },
    {
      section: "trust_badge",
      title: "Zero Preservatives",
      value: null,
      description: "Zero palm oil, no artificial flavors, 100% gluten-free & vegan.",
      icon: "verified",
      accentColor: "bg-amber-500/15 text-amber-700",
      sortOrder: 2,
      isActive: true,
    },
    {
      section: "trust_badge",
      title: "The Gold Standard",
      value: null,
      description: "Hand-graded top 10% jumbo pearls for maximum lightness.",
      icon: "workspace_premium",
      accentColor: "bg-yellow-600/15 text-yellow-800",
      sortOrder: 3,
      isActive: true,
    },
    // Health Benefits
    {
      section: "health_benefit",
      title: "Rich Plant Protein",
      value: "16g / 100g",
      description: "Complete amino acid profile to fuel sustained mental clarity and muscle recovery.",
      icon: "fitness_center",
      accentColor: "from-amber-500/20 to-orange-500/10 text-amber-800",
      sortOrder: 0,
      isActive: true,
    },
    {
      section: "health_benefit",
      title: "Low Glycemic Index",
      value: "Low GI Rating",
      description: "Prevents insulin spikes and sustains energy throughout long productive afternoons.",
      icon: "monitor_heart",
      accentColor: "from-emerald-500/20 to-teal-500/10 text-emerald-800",
      sortOrder: 1,
      isActive: true,
    },
    {
      section: "health_benefit",
      title: "Kaempferol Antioxidants",
      value: "Cellular Shield",
      description: "Potent natural flavonoids known for cellular rejuvenation and anti-aging vitality.",
      icon: "energy_savings_leaf",
      accentColor: "from-purple-500/20 to-pink-500/10 text-purple-800",
      sortOrder: 2,
      isActive: true,
    },
    {
      section: "health_benefit",
      title: "Heart-Friendly Minerals",
      value: "High Mg, Low Na",
      description: "Naturally high in magnesium and potassium while exceptionally low in sodium.",
      icon: "favorite",
      accentColor: "from-rose-500/20 to-orange-500/10 text-rose-800",
      sortOrder: 3,
      isActive: true,
    },
  ];

  await prisma.featurePillar.deleteMany({});
  await prisma.featurePillar.createMany({ data: pillarsData });

  // 10. Marketplace Links
  const marketplacesData = [
    {
      name: "Amazon Prime",
      platformKey: "amazon",
      url: "https://www.amazon.in/s?k=Makhana+Gold",
      badgeText: "Prime 1-Day Delivery",
      borderHover: "hover:border-[#FF9900]",
      sortOrder: 0,
      isActive: true,
    },
    {
      name: "Flipkart Assured",
      platformKey: "flipkart",
      url: "https://www.flipkart.com/search?q=Makhana+Gold",
      badgeText: "Assured Quality",
      borderHover: "hover:border-[#2874F0]",
      sortOrder: 1,
      isActive: true,
    },
    {
      name: "Blinkit (10 Mins)",
      platformKey: "blinkit",
      url: "https://blinkit.com/s/?q=Makhana+Gold",
      badgeText: "10-Minute Delivery",
      borderHover: "hover:border-[#0C831F]",
      sortOrder: 2,
      isActive: true,
    },
    {
      name: "Zepto (10 Mins)",
      platformKey: "zepto",
      url: "https://www.zeptonow.com/search?q=Makhana+Gold",
      badgeText: "Instant Commerce",
      borderHover: "hover:border-[#7A1CAC]",
      sortOrder: 3,
      isActive: true,
    },
    {
      name: "Swiggy Instamart",
      platformKey: "instamart",
      url: "https://www.swiggy.com/instamart",
      badgeText: "Superfast Drop",
      borderHover: "hover:border-[#FC8019]",
      sortOrder: 4,
      isActive: true,
    },
  ];

  for (const m of marketplacesData) {
    await prisma.marketplaceLink.upsert({
      where: { platformKey: m.platformKey },
      update: m,
      create: m,
    });
  }

  // 11. FAQ Items (Backend Driven)
  const faqsData = [
    {
      category: "Orders & Shipping",
      question: "How long does shipping and dispatch take?",
      answer:
        "All orders are hand-packed within 24 hours of roasting. Standard delivery takes 3-5 business days across all major metro and tier-1 cities in India. Tracking details are automatically emailed.",
      sortOrder: 0,
      isActive: true,
    },
    {
      category: "Orders & Shipping",
      question: "Do you offer free shipping?",
      answer:
        "Yes! Free standard delivery is automatically unlocked on all orders of ₹500 or more.",
      sortOrder: 1,
      isActive: true,
    },
    {
      category: "Orders & Shipping",
      question: "Can I modify my shipping address after placing an order?",
      answer:
        "If your order has not yet left our facility, contact mmakhanaltd@gmail.com within 2 hours of placing the order to update your details.",
      sortOrder: 2,
      isActive: true,
    },
    {
      category: "Quality & Sourcing",
      question: "Where is your makhana sourced?",
      answer:
        "We source directly from generational wetland farming communities in Darbhanga and Madhubani, Bihar — the traditional heartland producing the largest, purest fox nut seeds in the world.",
      sortOrder: 0,
      isActive: true,
    },
    {
      category: "Quality & Sourcing",
      question: "How are your flavoured makhana prepared?",
      answer:
        "Our fox nuts are slow dry-roasted in artisanal cast pans without deep frying in palm oil. We use natural spice blends and cold-pressed oils for seasoning.",
      sortOrder: 1,
      isActive: true,
    },
    {
      category: "Quality & Sourcing",
      question: "Are all products gluten-free and vegan?",
      answer:
        "Yes, all our roasted and flavoured makhana products are 100% gluten-free, vegetarian, non-GMO, and free from synthetic preservatives.",
      sortOrder: 2,
      isActive: true,
    },
    {
      category: "Returns & Corporate",
      question: "What is your return & replacement policy?",
      answer:
        "We stand by our quality promise. If your package arrives damaged or you are unsatisfied with freshness, request a replacement within 7 days of delivery.",
      sortOrder: 0,
      isActive: true,
    },
    {
      category: "Returns & Corporate",
      question: "Do you offer custom corporate gifting or bulk orders?",
      answer:
        "Yes! We specialize in bespoke corporate gift hampers and festive bundles with custom branding. Reach out through our contact form for corporate pricing.",
      sortOrder: 1,
      isActive: true,
    },
  ];

  await prisma.faqItem.deleteMany({});
  await prisma.faqItem.createMany({ data: faqsData });

  // 12. Site Settings
  const settingsData = [
    {
      key: "support_email",
      value: "mmakhanaltd@gmail.com",
      description: "Customer care concierge email",
    },
    {
      key: "support_phone",
      value: "+91 60016 84216",
      description: "WhatsApp & Hotline customer care number",
    },
    {
      key: "support_hours",
      value: "Mon — Sat from 9:30 AM to 6:30 PM IST",
      description: "Customer service operating hours",
    },
    {
      key: "studio_address",
      value: "Makhana Gold Pvt. Ltd., Connaught Place, New Delhi, 110001, India",
      description: "Experience Studio & Corporate Headquarters",
    },
    {
      key: "free_shipping_threshold",
      value: "500",
      description: "Minimum order cart value for free doorstep shipping in INR",
    },
    {
      key: "fssai_license",
      value: "10021022000123",
      description: "FSSAI Food Safety & Standards Authority License Number",
    },
    {
      key: "gstin_number",
      value: "10AAACM1234F1Z5",
      description: "Official Registered GSTIN Number",
    },
  ];

  for (const s of settingsData) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: s,
      create: s,
    });
  }

  console.log("✅ Seed complete! All enterprise data populated in database successfully:", {
    categories: [roasted.slug, flavoured.slug],
    products: [himalayan.slug, truffle.slug, periPeri.slug, heritageBundle.slug],
    bannersCount: heroBannersData.length,
    faqCount: faqsData.length,
    pillarsCount: pillarsData.length,
    marketplacesCount: marketplacesData.length,
    settingsCount: settingsData.length,
    adminLogin: { email: admin.email, password: "Admin@12345" },
    customerLogin: { email: customer.email, password: "Customer@12345" },
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
