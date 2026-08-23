import { prisma } from "../src/lib/db";

async function main() {
  console.log("Seeding high-ranking SEO blog articles...");

  const blogs = [
    {
      title: "10 Proven Health Benefits of Fox Nuts (Makhana): The Ancient Superfood for Weight Loss & Heart Health",
      slug: "health-benefits-of-makhana-fox-nuts-weight-loss",
      category: "Health & Nutrition",
      tags: "Makhana, Fox Nuts, Weight Loss, Heart Health, Superfood, Low Calorie",
      coverImage: "/images/vibrant/hero.jpg",
      excerpt:
        "Discover why slow-roasted Fox Nuts (Makhana) are revered by nutritionists and fitness experts. From natural anti-aging flavonoids to low-glycemic sustained energy, explore 10 science-backed benefits.",
      readingTimeMinutes: 6,
      featured: true,
      authorName: "Dr. Ananya Sharma",
      authorRole: "Senior Clinical Nutritionist & Food Biochemist",
      authorAvatar: "/images/logo/logo.png",
      metaTitle: "10 Proven Health Benefits of Makhana (Fox Nuts) for Weight Loss | Makhana Gold",
      metaDescription:
        "Learn why Makhana (Fox Nuts) is the ultimate healthy snack for weight loss, heart health, and anti-aging. 100% natural, low calorie, and nutrient-rich.",
      metaKeywords:
        "makhana benefits, fox nuts weight loss, roasted makhana nutrition, low calorie snacks, bihar makhana",
      content: `## The Ancient Wetland Lotus Seed Superfood

For centuries, **Makhana (Euryale ferox)**, also known as Fox Nuts or Gorgon Nuts, has been celebrated in Ayurveda for its exceptional therapeutic and nutritional properties. Sourced from the tranquil wetlands of Bihar, these pristine white puffs are harvested by generational pond farmers and slow-roasted to crispy golden perfection.

Unlike ultra-processed fried chips or artificially flavored crackers, artisanal makhana delivers pure, unadulterated nourishment with zero trans fats and zero cholesterol.

---

### 1. Exceptional Low Calorie Snack for Sustainable Weight Loss
One cup (32g) of dry-roasted Makhana contains **less than 100 calories** while offering a satisfying, crunchy mouthfeel. Packed with complex carbohydrates and resistant starch, makhana promotes satiety and curbs mid-meal hunger spikes.

### 2. High Quality Plant Protein & Amino Acid Profile
Makhana contains approximately **9.7g of plant protein per 100g**, featuring critical essential amino acids like *glutamine, arginine, and methionine* that support muscle recovery and cellular repair.

### 3. Low Glycemic Index (GI) — Diabetic Friendly
With an exceptionally low glycemic index and low sodium content, slow-roasted makhana prevents abrupt glucose surges, making it the premier evening snack for people managing diabetes and hypertension.

### 4. Rich in Anti-Aging Flavonoids & Kaempferol
Makhana contains potent natural phytonutrients, notably **Kaempferol**, a powerful polyphenol that helps neutralize free radicals, reduce cellular oxidative stress, and maintain youthful skin elasticity.

### 5. Heart-Healthy Magnesium & Potassium Balance
With high potassium and low sodium ratios, makhana helps regulate vascular tone and maintain healthy systolic blood pressure levels.

---

## Nutritional Breakdown per 100g

| Nutrient | Quantity | Daily Value (DV) |
| :--- | :--- | :--- |
| **Protein** | 9.7 g | 19% |
| **Fiber** | 14.5 g | 52% |
| **Calcium** | 60 mg | 6% |
| **Magnesium** | 210 mg | 50% |
| **Potassium** | 500 mg | 11% |
| **Total Fat** | 0.5 g | < 1% |

---

## How to Incorporate Makhana into Your Daily Routine
- **Afternoon Snack:** Enjoy our hand-graded **Himalayan Pink Salt Makhana** with green tea.
- **Pre-Workout Fuel:** A handful of **Black Truffle & Artisan Herb Makhana** delivers clean energy without heaviness.
- **Kheer & Desserts:** Grind roasted makhana into milk with cardamom and saffron for a guilt-free festive pudding.

> [!TIP]
> Always choose hand-graded, dry-roasted makhana with zero hydrogenated palm oil for maximum antioxidant retention.
`,
    },
    {
      title: "Why Bihar Chana Sattu is India's Ultimate 100% Natural Plant Protein Powerhouse",
      slug: "bihar-chana-sattu-plant-protein-benefits",
      category: "Fitness & Protein",
      tags: "Sattu, Roasted Gram Flour, Plant Protein, Gym Nutrition, Digestion, Cooling Drink",
      coverImage: "/images/products/sattu_chana_pack.jpg",
      excerpt:
        "Move over ultra-processed whey isolates. Traditional cold stone-ground Bihari Roasted Chana Sattu provides 25g of bioavailable plant protein, insoluble fiber, and instant digestive cooling.",
      readingTimeMinutes: 5,
      featured: false,
      authorName: "Vikram Malhotra",
      authorRole: "Sports Nutritionist & Strength Coach",
      authorAvatar: "/images/logo/logo.png",
      metaTitle: "Why Chana Sattu is India's Best Natural Protein Powder | Makhana Gold",
      metaDescription:
        "Discover the power of 100% pure stone-ground Chana Sattu. 25g plant protein, zero chemicals, and natural body cooling. Buy authentic Bihari sattu online.",
      metaKeywords:
        "chana sattu benefits, sattu protein powder, bihari sattu sharbat, natural protein, stone ground sattu",
      content: `## The Generational Superfood of Bihar

Often called the **"Desi Whey Protein of India"**, Sattu is made by slow-roasting Bengal gram (desi kala chana) in wood-fired sand cauldrons, followed by traditional cold stone-ground chakki milling. This artisanal process locks in all dietary fibers, vitamins, and minerals while pre-cooking the proteins for effortless digestion.

---

### Key Health Advantages of Artisanal Chana Sattu

#### 1. 25g Bioavailable Plant Protein per 100g
Unlike synthetic protein powders that cause bloating and indigestion, stone-ground sattu is 100% whole-food nutrition that fuels lean muscle repair and stamina.

#### 2. Natural Internal Body Cooler (Gastrointestinal Soother)
In the sweltering summers of northern India, a glass of chilled **Spiced Sattu Sharbat** with roasted cumin and rock salt is legendary for preventing heatstroke, neutralizing acidity, and rehydrating the system.

#### 3. Cleanses the Colon with Insoluble Fiber
Sattu is loaded with dietary fiber that scours the intestinal walls, supports healthy gut microbiome diversity, and eliminates constipation.

---

## 2-Minute Energy Drink: The Authentic Bihari Sattu Sharbat
1. Take 3 tablespoons of **Pure Roasted Chana Sattu**.
2. Add 250ml of cold water or thin buttermilk.
3. Add 1/2 tsp roasted cumin powder (*jeera*), a pinch of black salt, and 1 tsp fresh lemon juice.
4. Stir thoroughly and garnish with fresh mint leaves. Enjoy instant 12g protein boost!
`,
    },
    {
      title: "Red Rice Poha vs White Poha: Glycemic Index, Fiber & Nutrition Breakdown for Diabetics",
      slug: "red-rice-poha-vs-white-poha-nutrition-diabetics",
      category: "Superfood Recipes",
      tags: "Red Rice Poha, White Poha, Low GI, Diabetic Diet, Iron Rich, Gluten Free",
      coverImage: "/images/products/poha_red_rice.jpg",
      excerpt:
        "Is Red Rice Poha genuinely healthier than traditional white flattened rice? We dive into anthocyanin antioxidants, iron density, and low-GI insulin control.",
      readingTimeMinutes: 4,
      featured: false,
      authorName: "Dr. Ananya Sharma",
      authorRole: "Senior Clinical Nutritionist & Food Biochemist",
      authorAvatar: "/images/logo/logo.png",
      metaTitle: "Red Rice Poha vs White Poha: Which is Better for Diabetes? | Makhana Gold",
      metaDescription:
        "Detailed comparison of Red Rice Poha vs White Poha. Learn how hand-pounded red rice poha delivers 3x more iron and anthocyanins for blood sugar control.",
      metaKeywords:
        "red rice poha benefits, red poha vs white poha, low glycemic breakfast, diabetic poha, organic poha",
      content: `## Unveiling the Power of Hand-Pounded Red Paddy Flakes

Poha (flattened rice) has been an integral staple of Indian breakfasts for generations. However, modern artisanal milling has revitalized **Organic Hand-Pounded Red Rice Poha**, made from unpolished indigenous red rice varieties with the bran and germ layers intact.

---

### What Makes Red Rice Poha Unique?

1. **Rich in Anthocyanin Antioxidants:** The deep ruby red hue comes from natural anthocyanins, the same heart-protecting antioxidants found in blueberries.
2. **3x Higher Iron Content:** Hand-pounding retains the mineral-dense outer husk, making it an excellent dietary ally against anemia.
3. **Slow Digesting Low-GI Carbs:** High soluble fiber slows carbohydrate breakdown, preventing post-prandial blood sugar spikes.

---

## Head-to-Head Comparison: Red vs White Poha

| Parameter | Red Rice Poha | Standard White Poha |
| :--- | :--- | :--- |
| **Bran Retention** | 100% Whole Grain | Stripped During Polishing |
| **Dietary Fiber** | 4.8 g / 100g | 1.2 g / 100g |
| **Iron Density** | High (5.5 mg) | Moderate (1.8 mg) |
| **Glycemic Index** | Low (approx. 50) | High (approx. 70) |
`,
    },
  ];

  for (const b of blogs) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: b.slug } });
    if (!existing) {
      await prisma.blogPost.create({ data: b });
      console.log("Created blog:", b.title);
    } else {
      await prisma.blogPost.update({ where: { slug: b.slug }, data: b });
      console.log("Updated blog:", b.title);
    }
  }

  console.log("Seeded initial blog articles successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
