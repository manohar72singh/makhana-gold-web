import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Story & Generational Bihar Wetland Heritage",
  description:
    "Discover the heritage behind Makhana Gold. Partnering directly with generational wetland harvesting families in Mithila & Darbhanga, Bihar to deliver authentic slow-roasted superfoods.",
  alternates: {
    canonical: "/our-story",
  },
  openGraph: {
    title: "Our Story & Generational Bihar Heritage | Makhana Gold",
    description:
      "Rooted in ancient wetland wisdom, refined for modern wellness. 100% natural slow-roasted lotus seeds.",
    url: "https://makhanagold.com/our-story",
    siteName: "Makhana Gold",
    images: ["/images/vibrant/wetlands.jpg"],
  },
};

export default function OurStoryPage() {
  return (
    <main className="pb-huge overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-xl pb-huge px-gutter overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5EFE0]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/vibrant/wetlands.jpg"
            alt="Harvesting Makhana in Bihar Wetlands"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FFFDF9] via-[#FFFDF9]/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-container-max mx-auto text-center mt-12">
          <span className="font-label-md text-xs text-primary font-bold tracking-[0.15em] uppercase mb-4 block">
            The Makhana Gold Story
          </span>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-6 leading-tight">
            Rooted in Heritage.<br />
            <span className="italic font-normal">Refined for Today.</span>
          </h1>
          <p className="font-body-lg text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto mb-8 leading-relaxed">
            We bridge the gap between ancient wetland wisdom and modern wellness, bringing you the world&apos;s most premium fox nuts, cultivated with care and perfected through generations.
          </p>
          <a
            href="#process"
            className="bg-[#D84315] hover:bg-secondary text-white px-8 py-4 rounded-xl font-label-md text-xs uppercase tracking-widest transition-all shadow-warm-1 hover:shadow-warm-2 inline-flex items-center gap-2 active:scale-95"
          >
            Discover Our Process
            <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
          </a>
        </div>
      </section>

      {/* 2. Our Heritage (Bihar Sourcing) - Asymmetric Layout */}
      <section className="py-huge px-gutter max-w-container-max mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1 relative">
            <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold block mb-2">
              Our Origin
            </span>
            <h2 className="font-headline-xl text-headline-xl-mobile md:text-3xl font-bold text-on-surface mb-2">
              Our Heritage
            </h2>
            <h3 className="font-headline-sm text-lg text-primary font-semibold mb-6">
              Sourced from the heart of Bihar
            </h3>
            <p className="font-body-md text-sm text-on-surface-variant mb-4 leading-relaxed">
              Our journey begins in the mineral-rich wetlands of Northern India, a region revered for centuries as the true home of the lotus seed (Euryale ferox). Here, the unique confluence of soil, water, and climate produces a fox nut of unparalleled quality — larger, purer, and naturally nutrient-dense.
            </p>
            <p className="font-body-md text-sm text-on-surface-variant mb-8 leading-relaxed">
              We partner directly with artisanal farming communities who employ time-honored, sustainable harvesting techniques. This direct relationship ensures absolute purity while empowering the families who have safeguarded this agricultural treasure for generations.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center text-primary font-label-md text-xs uppercase tracking-wider hover:text-secondary transition-colors gap-2 font-bold"
            >
              <span>Explore The Collection</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="space-y-4">
                <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-ambient border border-outline-variant/30">
                  <Image
                    src="/images/our_story_makhana_gold/a-close-up-high-definition-editorial-photograph-of-raw-fresh-b4ff56db.jpg"
                    alt="Farmer holding raw makhana"
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-xs">
                  <span className="block font-label-sm text-[10px] uppercase tracking-wider text-primary font-bold mb-0.5">
                    Harvest Region
                  </span>
                  <span className="font-body-md text-sm font-semibold text-on-surface">
                    Darbhanga & Madhubani, Bihar
                  </span>
                </div>
              </div>

              <div className="pt-8 space-y-4">
                <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-ambient border border-outline-variant/30">
                  <Image
                    src="/images/our_story_makhana_gold/a-sweeping-beautiful-editorial-drone-shot-looking-down-at-a--dde33810.jpg"
                    alt="Wetlands of Bihar"
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-xs">
                  <span className="block font-label-sm text-[10px] uppercase tracking-wider text-primary font-bold mb-0.5">
                    Cultivation
                  </span>
                  <span className="font-body-md text-sm font-semibold text-on-surface">
                    100% Wetland Grown & Chemical-Free
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Gold Standard (Quality Bento Grid) */}
      <section id="process" className="bg-surface-container-low py-huge px-gutter border-y border-outline-variant/30">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16 max-w-xl mx-auto">
            <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold block mb-2">
              Uncompromising Quality
            </span>
            <h2 className="font-headline-xl text-headline-xl-mobile md:text-3xl font-bold text-on-surface mb-3">
              The Gold Standard
            </h2>
            <div className="w-16 h-0.5 bg-primary-container mx-auto mb-4" />
            <p className="font-body-lg text-sm text-on-surface-variant leading-relaxed">
              Uncompromising quality at every step, from pond harvest to your modern pantry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Roasting (2 cols) */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-ambient border border-outline-variant/30 md:col-span-2 overflow-hidden relative group flex flex-col justify-between min-h-[300px]">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-2xl">local_fire_department</span>
                </div>
                <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-3">
                  Artisanal Dry Roasting
                </h3>
                <p className="font-body-md text-sm text-on-surface-variant max-w-md leading-relaxed">
                  Each batch is slow-roasted in traditional cast pans to absolute perfection, ensuring a light, crisp crunch that preserves the fragile cellular micronutrients of the seed.
                </p>
              </div>

              <div className="relative z-10 mt-6">
                <span className="inline-block bg-primary/10 text-primary font-label-sm text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                  Zero Palm Oil • Never Deep Fried
                </span>
              </div>
            </div>

            {/* Card 2: Grading */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-ambient border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-2xl">verified</span>
                </div>
                <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-3">
                  Premium Grading
                </h3>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                  We hand-select only the top 10% of harvest for our &lsquo;Gold&rsquo; tier — ensuring maximum pearl size, pristine white colour, and crisp texture.
                </p>
              </div>
              <div className="mt-6">
                <span className="inline-block bg-primary text-on-primary font-label-sm text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                  Top 10% Only
                </span>
              </div>
            </div>

            {/* Card 3: Purity */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-ambient border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-2xl">spa</span>
                </div>
                <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-3">
                  Absolute Purity
                </h3>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                  Zero artificial preservatives, MSG, synthetic colours, or artificial sweeteners. Just the wholesome goodness of nature, carefully preserved.
                </p>
              </div>
              <div className="mt-6">
                <span className="text-xs text-primary font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check</span>
                  100% Clean Label
                </span>
              </div>
            </div>

            {/* Card 4: Conscious Packaging (2 cols) */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-ambient border border-outline-variant/30 md:col-span-2 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">inventory_2</span>
                </div>
                <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-2">
                  Aroma-Lock Conscious Packaging
                </h3>
                <p className="font-body-md text-sm text-on-surface-variant mb-4 leading-relaxed">
                  Our multi-barrier resealable pouches block oxygen, UV rays, and humidity, keeping every fox nut as crunchy on day 90 as the day it was roasted.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center text-primary font-label-md text-xs uppercase tracking-wider hover:text-secondary transition-colors gap-1.5 font-bold"
                >
                  <span>Experience The Crunch</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>

              <div className="w-full md:w-1/3 h-48 relative rounded-2xl overflow-hidden border border-outline-variant/30 shrink-0">
                <Image
                  src="/images/our_story_makhana_gold/a-clean-minimalist-product-shot-of-makhana-gold-premium-pack-8b9aaaa0.jpg"
                  alt="Premium Packaging"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Our Mission & Values */}
      <section className="py-huge px-gutter max-w-container-max mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold block mb-2">
              Our Vision
            </span>
            <h2 className="font-headline-xl text-headline-xl-mobile md:text-3xl font-bold text-on-surface mb-3">
              Redefining Modern Snacking
            </h2>
            <p className="font-body-lg text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              We believe that conscious living shouldn&apos;t require compromising between nutritional integrity and mouth-watering flavour.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-ambient">
              <span className="material-symbols-outlined text-primary text-3xl mb-3">psychology</span>
              <h4 className="font-bold text-base text-on-surface mb-2">Mindful Consumption</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Encouraging snacking habits that fuel cognitive focus, steady metabolic health, and physical vitality.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-ambient">
              <span className="material-symbols-outlined text-primary text-3xl mb-3">handshake</span>
              <h4 className="font-bold text-base text-on-surface mb-2">Farmer Empowerment</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Paying premium prices directly to generational harvesting families, bypassing intermediaries.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-ambient">
              <span className="material-symbols-outlined text-primary text-3xl mb-3">diamond</span>
              <h4 className="font-bold text-base text-on-surface mb-2">Quiet Luxury</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Treating pantry essentials as sophisticated culinary experiences that elevate daily rituals.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
