import { prisma } from "../src/lib/db";

async function main() {
  const updates = [
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

  for (const item of updates) {
    const product = await prisma.product.findUnique({ where: { slug: item.slug } });
    if (product) {
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: item.url,
          altText: product.name,
          sortOrder: 0,
          isPrimary: true,
        },
      });
      console.log("Updated image for:", product.name, "->", item.url);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
