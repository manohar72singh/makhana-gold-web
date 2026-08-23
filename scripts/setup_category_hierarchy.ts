import { prisma } from "../src/lib/db";

async function main() {
  console.log("Setting up 3-Pillar Hierarchical Categories (Makhana, Sattu, Poha)...");

  // 1. TOP-LEVEL PILLARS (Parents)
  const makhanaParent = await prisma.category.upsert({
    where: { slug: "makhana" },
    update: { name: "Makhana (Fox Nuts)", parentId: null },
    create: { name: "Makhana (Fox Nuts)", slug: "makhana" },
  });

  const sattuParent = await prisma.category.upsert({
    where: { slug: "sattu" },
    update: { name: "Artisanal Sattu", parentId: null },
    create: { name: "Artisanal Sattu", slug: "sattu" },
  });

  const pohaParent = await prisma.category.upsert({
    where: { slug: "poha" },
    update: { name: "Traditional Poha", parentId: null },
    create: { name: "Traditional Poha", slug: "poha" },
  });

  // 2. SUB-CATEGORIES FOR MAKHANA
  const roastedMakhana = await prisma.category.upsert({
    where: { slug: "roasted-makhana" },
    update: { name: "Slow-Roasted & Raw Makhana", parentId: makhanaParent.id },
    create: { name: "Slow-Roasted & Raw Makhana", slug: "roasted-makhana", parentId: makhanaParent.id },
  });

  const flavouredMakhana = await prisma.category.upsert({
    where: { slug: "flavoured-makhana" },
    update: { name: "Flavoured Gourmet Makhana", parentId: makhanaParent.id },
    create: { name: "Flavoured Gourmet Makhana", slug: "flavoured-makhana", parentId: makhanaParent.id },
  });

  const makhanaHampers = await prisma.category.upsert({
    where: { slug: "makhana-hampers" },
    update: { name: "Festive Gift Hampers", parentId: makhanaParent.id },
    create: { name: "Festive Gift Hampers", slug: "makhana-hampers", parentId: makhanaParent.id },
  });

  // 3. SUB-CATEGORIES FOR SATTU
  const pureChanaSattu = await prisma.category.upsert({
    where: { slug: "chana-sattu" },
    update: { name: "Pure Roasted Chana Sattu", parentId: sattuParent.id },
    create: { name: "Pure Roasted Chana Sattu", slug: "chana-sattu", parentId: sattuParent.id },
  });

  const spicedSattu = await prisma.category.upsert({
    where: { slug: "spiced-sattu" },
    update: { name: "Spiced Sharbat & Drink Mix", parentId: sattuParent.id },
    create: { name: "Spiced Sharbat & Drink Mix", slug: "spiced-sattu", parentId: sattuParent.id },
  });

  const fitnessSattu = await prisma.category.upsert({
    where: { slug: "fitness-sattu" },
    update: { name: "High-Protein & Fitness Sattu", parentId: sattuParent.id },
    create: { name: "High-Protein & Fitness Sattu", slug: "fitness-sattu", parentId: sattuParent.id },
  });

  // 4. SUB-CATEGORIES FOR POHA
  const redBrownPoha = await prisma.category.upsert({
    where: { slug: "red-brown-poha" },
    update: { name: "Hand-Pounded Red & Brown Poha", parentId: pohaParent.id },
    create: { name: "Hand-Pounded Red & Brown Poha", slug: "red-brown-poha", parentId: pohaParent.id },
  });

  const thickBatataPoha = await prisma.category.upsert({
    where: { slug: "thick-batata-poha" },
    update: { name: "Thick Mota Poha (Batata)", parentId: pohaParent.id },
    create: { name: "Thick Mota Poha (Batata)", slug: "thick-batata-poha", parentId: pohaParent.id },
  });

  const pohaSnacks = await prisma.category.upsert({
    where: { slug: "poha-snacks" },
    update: { name: "Roasted Chivda & Instant Cups", parentId: pohaParent.id },
    create: { name: "Roasted Chivda & Instant Cups", slug: "poha-snacks", parentId: pohaParent.id },
  });

  // 5. MAP ALL PRODUCTS TO SPECIFIC SUB-CATEGORIES
  const productCategoryMapping = [
    // Makhana
    { slug: "himalayan-pink-salt-makhana", categoryId: roastedMakhana.id },
    { slug: "black-truffle-artisan-makhana", categoryId: flavouredMakhana.id },
    { slug: "peri-peri-cracked-pepper-makhana", categoryId: flavouredMakhana.id },
    { slug: "tangy-tomato-cheddar-makhana", categoryId: flavouredMakhana.id },
    { slug: "royal-harvest-festive-gift-box", categoryId: makhanaHampers.id },

    // Sattu
    { slug: "pure-roasted-chana-sattu-stone-ground", categoryId: pureChanaSattu.id },
    { slug: "multigrain-super-sattu-barley-chana", categoryId: pureChanaSattu.id },
    { slug: "spiced-namkeen-sattu-drink-sharbat-mix", categoryId: spicedSattu.id },
    { slug: "kala-chana-sprouted-moong-fitness-sattu", categoryId: fitnessSattu.id },
    { slug: "traditional-litti-chokha-paratha-filling-sattu", categoryId: pureChanaSattu.id },

    // Poha
    { slug: "organic-hand-pounded-red-rice-poha", categoryId: redBrownPoha.id },
    { slug: "artisanal-thick-batata-poha-mota", categoryId: thickBatataPoha.id },
    { slug: "whole-grain-brown-rice-poha", categoryId: redBrownPoha.id },
    { slug: "roasted-poha-chivda-diet-snack", categoryId: pohaSnacks.id },
    { slug: "instant-masala-poha-cup-ready-3-min", categoryId: pohaSnacks.id },
  ];

  for (const m of productCategoryMapping) {
    const p = await prisma.product.findUnique({ where: { slug: m.slug } });
    if (p) {
      await prisma.product.update({
        where: { id: p.id },
        data: { categoryId: m.categoryId },
      });
      console.log(`Assigned "${p.name}" to category ID ${m.categoryId}`);
    }
  }

  // 6. ENSURE CLEAN VALID IMAGE ASSETS FOR ALL PRODUCTS
  const imageFixes = [
    { slug: "himalayan-pink-salt-makhana", url: "/images/vibrant/pink-salt.jpg" },
    { slug: "black-truffle-artisan-makhana", url: "/images/vibrant/truffle.jpg" },
    { slug: "peri-peri-cracked-pepper-makhana", url: "/images/vibrant/peri-peri.jpg" },
    { slug: "tangy-tomato-cheddar-makhana", url: "/images/vibrant/tangy-tomato.jpg" },
    { slug: "royal-harvest-festive-gift-box", url: "/images/vibrant/hero.jpg" },
    { slug: "pure-roasted-chana-sattu-stone-ground", url: "/images/products/sattu_chana_pack.jpg" },
    { slug: "multigrain-super-sattu-barley-chana", url: "/images/products/sattu_chana_pack.jpg" },
    { slug: "spiced-namkeen-sattu-drink-sharbat-mix", url: "/images/products/sattu_sharbat_drink.jpg" },
    { slug: "kala-chana-sprouted-moong-fitness-sattu", url: "/images/products/sattu_chana_pack.jpg" },
    { slug: "traditional-litti-chokha-paratha-filling-sattu", url: "/images/products/sattu_litti_mix.jpg" },
    { slug: "organic-hand-pounded-red-rice-poha", url: "/images/products/poha_red_rice.jpg" },
    { slug: "artisanal-thick-batata-poha-mota", url: "/images/products/poha_thick_batata.jpg" },
    { slug: "whole-grain-brown-rice-poha", url: "/images/products/poha_red_rice.jpg" },
    { slug: "roasted-poha-chivda-diet-snack", url: "/images/products/poha_chivda_snack.jpg" },
    { slug: "instant-masala-poha-cup-ready-3-min", url: "/images/products/poha_thick_batata.jpg" },
  ];

  for (const imgFix of imageFixes) {
    const p = await prisma.product.findUnique({ where: { slug: imgFix.slug } });
    if (p) {
      await prisma.productImage.deleteMany({ where: { productId: p.id } });
      await prisma.productImage.create({
        data: {
          productId: p.id,
          url: imgFix.url,
          altText: p.name,
          sortOrder: 0,
          isPrimary: true,
        },
      });
    }
  }

  console.log("Category Hierarchy & Image mapping setup completed successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
