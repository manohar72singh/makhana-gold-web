import { prisma } from "../src/lib/db";

async function main() {
  console.log("Seeding 5 Sattu and 5 Poha products...");

  // 1. Get or Create Warehouse
  let warehouse = await prisma.warehouse.findFirst();
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        name: "Central Patna Warehouse",
        city: "Patna",
        state: "Bihar",
        pincode: "800001",
      },
    });
  }

  // 2. Ensure Categories
  const sattuCategory = await prisma.category.upsert({
    where: { slug: "sattu" },
    update: { name: "Pure Artisanal Sattu" },
    create: {
      name: "Pure Artisanal Sattu",
      slug: "sattu",
    },
  });

  const pohaCategory = await prisma.category.upsert({
    where: { slug: "poha" },
    update: { name: "Traditional Organic Poha" },
    create: {
      name: "Traditional Organic Poha",
      slug: "poha",
    },
  });

  // 3. Sattu Products
  const sattuProducts = [
    {
      name: "100% Pure Roasted Chana Sattu (Traditional Stone-Ground)",
      slug: "pure-roasted-chana-sattu-stone-ground",
      description:
        "Sourced from premium whole Bengal Gram, slow dry-roasted on sand beds, and cold stone-ground. The ultimate natural plant protein powerhouse of Bihar with 22g protein per 100g.",
      categoryId: sattuCategory.id,
      imageUrl: "/images/vibrant/hero.jpg",
      barcode: "8901911367010",
      attributes: ["best_seller", "high_protein", "stone_ground"],
      variants: [
        { sku: "MG-SAT-CHANA-500G", packSize: "500g Pouch", price: 149, compareAtPrice: 199, stock: 180 },
        { sku: "MG-SAT-CHANA-1KG", packSize: "1kg Family Pack", price: 279, compareAtPrice: 349, stock: 120 },
      ],
    },
    {
      name: "Multigrain Super Sattu (Chana, Barley/Jau & Roasted Wheat)",
      slug: "multigrain-super-sattu-barley-chana",
      description:
        "Nutrient-dense summer cooling superfood blending traditional roasted Bengal Gram, dietary-fiber rich Barley (Jau), and roasted wheat. Ideal for diabetic-friendly morning energy drinks.",
      categoryId: sattuCategory.id,
      imageUrl: "/images/vibrant/flavour-truffle.jpg",
      barcode: "8901911367027",
      attributes: ["cooling_summer_drink", "fiber_rich"],
      variants: [
        { sku: "MG-SAT-MULTI-500G", packSize: "500g Jar", price: 179, compareAtPrice: 229, stock: 150 },
        { sku: "MG-SAT-MULTI-1KG", packSize: "1kg Pouch", price: 329, compareAtPrice: 399, stock: 95 },
      ],
    },
    {
      name: "Spiced Namkeen Sattu Drink Mix (With Black Salt, Hing & Roasted Cumin)",
      slug: "spiced-namkeen-sattu-drink-sharbat-mix",
      description:
        "Ready-to-mix traditional Bihari Sattu Sharbat premix. Infused with rock salt, dry mint, roasted hing, and cumin. Just add chilled water and lime for an instant refreshing cooler.",
      categoryId: sattuCategory.id,
      imageUrl: "/images/vibrant/new-launch.jpg",
      barcode: "8901911367034",
      attributes: ["ready_to_mix", "best_seller"],
      variants: [
        { sku: "MG-SAT-SPICED-400G", packSize: "400g Jar", price: 199, compareAtPrice: 249, stock: 140 },
        { sku: "MG-SAT-SPICED-800G", packSize: "800g Value Pack", price: 369, compareAtPrice: 449, stock: 80 },
      ],
    },
    {
      name: "Kala Chana & Sprouted Moong Sattu (Fitness & Gym Clean Protein)",
      slug: "kala-chana-sprouted-moong-fitness-sattu",
      description:
        "Clean plant protein for active lifestyles and athletes. Crafted with unpeeled roasted black chickpeas and sprouted green moong for enhanced bioavailability and zero artificial sweeteners.",
      categoryId: sattuCategory.id,
      imageUrl: "/images/vibrant/flavour-cheese.jpg",
      barcode: "8901911367041",
      attributes: ["high_protein", "gym_fitness", "new"],
      variants: [
        { sku: "MG-SAT-GYM-500G", packSize: "500g Tin", price: 229, compareAtPrice: 299, stock: 110 },
        { sku: "MG-SAT-GYM-1KG", packSize: "1kg Jar", price: 429, compareAtPrice: 499, stock: 75 },
      ],
    },
    {
      name: "Traditional Litti Chokha & Paratha Special Filling Sattu",
      slug: "traditional-litti-chokha-paratha-filling-sattu",
      description:
        "Specially coarsed texture roasted gram flour formulated for authentic Bihari Litti stuffing, Makuni, and golden roasted Sattu parathas with rich nutty aroma.",
      categoryId: sattuCategory.id,
      imageUrl: "/images/vibrant/hero.jpg",
      barcode: "8901911367058",
      attributes: ["culinary_special", "authentic_bihar"],
      variants: [
        { sku: "MG-SAT-LITTI-500G", packSize: "500g Pouch", price: 169, compareAtPrice: 219, stock: 160 },
        { sku: "MG-SAT-LITTI-1KG", packSize: "1kg Pouch", price: 299, compareAtPrice: 379, stock: 100 },
      ],
    },
  ];

  // 4. Poha Products
  const pohaProducts = [
    {
      name: "Organic Hand-Pounded Red Rice Poha (Low GI & Iron-Rich)",
      slug: "organic-hand-pounded-red-rice-poha",
      description:
        "Made from traditional whole-grain unpolished red paddy. Rich in anthocyanin antioxidants, dietary fiber, and natural iron. Perfect for wholesome diabetic-friendly breakfast bowls.",
      categoryId: pohaCategory.id,
      imageUrl: "/images/vibrant/flavour-truffle.jpg",
      barcode: "8901911367065",
      attributes: ["best_seller", "organic", "low_gi"],
      variants: [
        { sku: "MG-POHA-RED-500G", packSize: "500g Pouch", price: 139, compareAtPrice: 179, stock: 175 },
        { sku: "MG-POHA-RED-1KG", packSize: "1kg Family Pack", price: 249, compareAtPrice: 319, stock: 130 },
      ],
    },
    {
      name: "Artisanal Thick Batata Poha (Mota Poha - Fluffy & Non-Sticky)",
      slug: "artisanal-thick-batata-poha-mota",
      description:
        "Premium grade thick flattened rice flakes crafted to absorb tempering flavors without turning mushy. Ideal for Indori, Kanda Poha and Maharashtrian breakfast.",
      categoryId: pohaCategory.id,
      imageUrl: "/images/vibrant/hero.jpg",
      barcode: "8901911367072",
      attributes: ["kitchen_staple", "best_seller"],
      variants: [
        { sku: "MG-POHA-THICK-500G", packSize: "500g Pouch", price: 99, compareAtPrice: 129, stock: 200 },
        { sku: "MG-POHA-THICK-1KG", packSize: "1kg Pouch", price: 189, compareAtPrice: 239, stock: 150 },
      ],
    },
    {
      name: "Whole Grain Brown Rice Poha (Bran-Rich Sustained Energy)",
      slug: "whole-grain-brown-rice-poha",
      description:
        "100% unpolished whole brown rice flakes preserving the nutrient-dense bran layer. Provides sustained morning energy release and aids healthy digestion.",
      categoryId: pohaCategory.id,
      imageUrl: "/images/vibrant/flavour-cheese.jpg",
      barcode: "8901911367089",
      attributes: ["whole_grain", "new"],
      variants: [
        { sku: "MG-POHA-BROWN-500G", packSize: "500g Pouch", price: 149, compareAtPrice: 189, stock: 130 },
        { sku: "MG-POHA-BROWN-1KG", packSize: "1kg Pouch", price: 269, compareAtPrice: 339, stock: 90 },
      ],
    },
    {
      name: "Roasted Poha Chivda Snack (Mildly Spiced with Peanuts & Curry Leaves)",
      slug: "roasted-poha-chivda-diet-snack",
      description:
        "Slow-roasted crispy thin poha blended with golden fried peanuts, roasted curry leaves, turmeric, and dry-roasted spices. Zero guilt 4 PM tea-time crunch.",
      categoryId: pohaCategory.id,
      imageUrl: "/images/vibrant/new-launch.jpg",
      barcode: "8901911367096",
      attributes: ["ready_to_eat", "diet_snack"],
      variants: [
        { sku: "MG-POHA-CHIV-200G", packSize: "200g Jar", price: 129, compareAtPrice: 169, stock: 160 },
        { sku: "MG-POHA-CHIV-400G", packSize: "400g Pouch", price: 229, compareAtPrice: 299, stock: 100 },
      ],
    },
    {
      name: "Instant Masala Poha Breakfast Cup (Ready in 3 Minutes with Boiling Water)",
      slug: "instant-masala-poha-cup-ready-3-min",
      description:
        "Freeze-dried artisanal poha with real vegetables, crunchy peanuts, and authentic tempered spices. Just add boiling water and enjoy anywhere on the go.",
      categoryId: pohaCategory.id,
      imageUrl: "/images/vibrant/hero.jpg",
      barcode: "8901911367102",
      attributes: ["instant_cup", "travel_friendly", "new"],
      variants: [
        { sku: "MG-POHA-CUP-80G", packSize: "80g Single Cup", price: 59, compareAtPrice: 79, stock: 250 },
        { sku: "MG-POHA-CUP-4PK", packSize: "Pack of 4 Cups", price: 219, compareAtPrice: 299, stock: 120 },
      ],
    },
  ];

  const allProducts = [...sattuProducts, ...pohaProducts];

  for (const item of allProducts) {
    const existing = await prisma.product.findUnique({
      where: { slug: item.slug },
      include: { variants: true },
    });

    let product = existing;

    if (!existing) {
      product = await prisma.product.create({
        data: {
          name: item.name,
          slug: item.slug,
          description: item.description,
          categoryId: item.categoryId,
          status: "active",
          images: {
            create: [
              {
                url: item.imageUrl,
                altText: item.name,
                sortOrder: 0,
                isPrimary: true,
              },
            ],
          },
        },
        include: { variants: true },
      });
      console.log(`Created product: ${item.name}`);
    } else {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          description: item.description,
          categoryId: item.categoryId,
          status: "active",
        },
      });
    }

    if (!product) continue;

    // Attributes (barcode, marketing badges)
    await prisma.productAttribute.deleteMany({ where: { productId: product.id } });
    const attrsData = [
      { productId: product.id, key: "barcode", value: item.barcode },
      ...item.attributes.map((attr) => ({
        productId: product.id,
        key: attr,
        value: "true",
      })),
    ];
    await prisma.productAttribute.createMany({ data: attrsData });

    // Variants & Inventory
    for (const vData of item.variants) {
      let variant = await prisma.productVariant.findUnique({
        where: { sku: vData.sku },
      });

      if (!variant) {
        variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: vData.sku,
            packSize: vData.packSize,
            price: vData.price,
            compareAtPrice: vData.compareAtPrice,
          },
        });
      } else {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            packSize: vData.packSize,
            price: vData.price,
            compareAtPrice: vData.compareAtPrice,
          },
        });
      }

      // Warehouse Inventory
      await prisma.inventoryStock.upsert({
        where: {
          variantId_warehouseId: {
            variantId: variant.id,
            warehouseId: warehouse.id,
          },
        },
        update: {
          quantityOnHand: vData.stock,
        },
        create: {
          variantId: variant.id,
          warehouseId: warehouse.id,
          quantityOnHand: vData.stock,
        },
      });
    }
  }

  console.log("Successfully seeded 5 Sattu and 5 Poha products with Barcodes, Variants and Stock!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
