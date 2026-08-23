import Image from "next/image";
import Link from "next/link";
import {
  AmazonIcon,
  FlipkartIcon,
  BlinkitIcon,
  ZeptoIcon,
  InstamartIcon,
} from "./MarketplaceLogos";
import { MarketplaceLinkData } from "@/lib/content";

const ICON_MAP: Record<string, React.ReactNode> = {
  amazon: <AmazonIcon className="w-9 h-9" />,
  flipkart: <FlipkartIcon className="w-9 h-9" />,
  blinkit: <BlinkitIcon className="w-9 h-9" />,
  zepto: <ZeptoIcon className="w-9 h-9" />,
  instamart: <InstamartIcon className="w-9 h-9" />,
};

const DEFAULT_PLATFORMS: MarketplaceLinkData[] = [
  {
    id: "amazon",
    name: "Amazon Prime",
    platformKey: "amazon",
    url: "https://www.amazon.in/s?k=Makhana+Gold",
    borderHover: "hover:border-[#FF9900]",
  },
  {
    id: "flipkart",
    name: "Flipkart Assured",
    platformKey: "flipkart",
    url: "https://www.flipkart.com/search?q=Makhana+Gold",
    borderHover: "hover:border-[#2874F0]",
  },
  {
    id: "blinkit",
    name: "Blinkit (10 Mins)",
    platformKey: "blinkit",
    url: "https://blinkit.com/s/?q=Makhana+Gold",
    borderHover: "hover:border-[#0C831F]",
  },
  {
    id: "zepto",
    name: "Zepto (10 Mins)",
    platformKey: "zepto",
    url: "https://www.zeptonow.com/search?q=Makhana+Gold",
    borderHover: "hover:border-[#7A1CAC]",
  },
  {
    id: "instamart",
    name: "Swiggy Instamart",
    platformKey: "instamart",
    url: "https://www.swiggy.com/instamart",
    borderHover: "hover:border-[#FC8019]",
  },
];

export function MarketplaceShowcaseBanner({
  platforms = DEFAULT_PLATFORMS,
}: {
  platforms?: MarketplaceLinkData[];
}) {
  const displayPlatforms = platforms.length > 0 ? platforms : DEFAULT_PLATFORMS;

  return (
    <section className="py-6 sm:py-8 md:py-10 px-5 sm:px-gutter max-w-container-max mx-auto">
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-amber-900/20 bg-[#0E0A05] text-white">
        
        {/* Background Artwork */}
        <div className="absolute inset-0">
          <Image
            src="/images/banners/marketplace_bottom_banner.jpg"
            alt="Makhana Gold Available Across Marketplaces"
            fill
            sizes="100vw"
            className="object-cover object-right sm:object-center opacity-65"
            priority={false}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C0804] via-[#0C0804]/90 to-[#0C0804]/30" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 p-4 sm:p-6 md:p-8 max-w-2xl space-y-3 sm:space-y-4">
          
          {/* Header Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-label-md uppercase tracking-widest font-bold">
            <span className="material-symbols-outlined text-[14px] text-amber-400">verified</span>
            <span>Nationwide Availability</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h2 className="font-display-lg text-lg sm:text-2xl lg:text-3xl text-[#FDF8EE] font-bold leading-tight">
              Now Available On Your Favorite Apps
            </h2>
            <p className="font-body-md text-xs sm:text-sm text-amber-100/80 leading-relaxed">
              Order fresh slow-roasted Bihar wetland makhana with fast doorstep delivery.
            </p>
          </div>

          {/* Clean Logo-Only Action Icons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
            {displayPlatforms.map((mp) => (
              <a
                key={mp.id}
                href={mp.url}
                target="_blank"
                rel="noopener noreferrer"
                title={mp.name}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white text-[#1C150C] border border-white/40 transition-all duration-300 flex items-center justify-center shadow-md hover:scale-110 hover:shadow-lg cursor-pointer ${
                  mp.borderHover || "hover:border-amber-400"
                }`}
              >
                {ICON_MAP[mp.platformKey] || (
                  <span className="material-symbols-outlined text-2xl text-amber-800">
                    shopping_bag
                  </span>
                )}
              </a>
            ))}
          </div>

          {/* Direct Store D2C Privilege Note */}
          <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 border-t border-white/15">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-amber-200">
              <span className="material-symbols-outlined text-amber-400 text-base">local_mall</span>
              <span>
                Want 15% off? <strong>Order direct on our website with code GOLDEN15.</strong>
              </span>
            </div>
            <Link
              href="/shop"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E64A19] to-[#D84315] hover:brightness-110 text-white text-[11px] font-bold font-label-md uppercase tracking-wider transition-all shadow-md shrink-0 inline-flex items-center gap-1.5"
            >
              <span>Shop Flagship</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
