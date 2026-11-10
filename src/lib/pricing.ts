/**
 * Makhana Gold Unified Wholesale & B2B Volume Pricing Engine
 * Provides transparent tiered discounts for retail, pantry bulk,
 * retailer wholesale, and super distributors.
 */

export interface WholesaleTier {
  id: number;
  name: string;
  badge: string;
  minQty: number;
  maxQty: number | null;
  discountPercent: number;
  description: string;
}

export const WHOLESALE_TIERS: WholesaleTier[] = [
  {
    id: 1,
    name: "Retail Pack",
    badge: "Retail",
    minQty: 1,
    maxQty: 39,
    discountPercent: 0,
    description: "Standard retail packs (< 10 kg). Order 10 kg+ (40+ packs) for wholesale rates.",
  },
  {
    id: 2,
    name: "Wholesale (10 kg+)",
    badge: "15% OFF",
    minQty: 40,
    maxQty: 99,
    discountPercent: 15,
    description: "Official wholesale entry tier (Min 10 kg MOQ / 40–99 packs of 250g).",
  },
  {
    id: 3,
    name: "Bulk Wholesale (25 kg+)",
    badge: "25% OFF",
    minQty: 100,
    maxQty: 399,
    discountPercent: 25,
    description: "Wholesale carton supply (25 kg – 99 kg / 100–399 packs).",
  },
  {
    id: 4,
    name: "Master Distributor (100 kg+)",
    badge: "35% OFF",
    minQty: 400,
    maxQty: null,
    discountPercent: 35,
    description: "Institutional & pallet supply direct from Bihar harvest facility (100 kg+ / 400+ packs).",
  },
];

/**
 * Returns the matching wholesale tier for a given purchase quantity.
 */
export function getTierForQuantity(qty: number): WholesaleTier {
  const safeQty = Math.max(1, qty);
  for (let i = WHOLESALE_TIERS.length - 1; i >= 0; i--) {
    const tier = WHOLESALE_TIERS[i];
    if (safeQty >= tier.minQty) {
      return tier;
    }
  }
  return WHOLESALE_TIERS[0];
}

/**
 * Calculates the effective unit price after applying wholesale volume tier discounts.
 */
export function calculateTierPrice(basePrice: number, qty: number): number {
  const tier = getTierForQuantity(qty);
  if (tier.discountPercent === 0) {
    return Math.round(basePrice * 100) / 100;
  }
  const discounted = basePrice * (1 - tier.discountPercent / 100);
  return Math.round(discounted * 100) / 100;
}

/**
 * Calculates total savings amount for a given quantity.
 */
export function getTierSavings(basePrice: number, qty: number): number {
  const tierPrice = calculateTierPrice(basePrice, qty);
  const totalOriginal = basePrice * qty;
  const totalTier = tierPrice * qty;
  return Math.max(0, Math.round((totalOriginal - totalTier) * 100) / 100);
}
