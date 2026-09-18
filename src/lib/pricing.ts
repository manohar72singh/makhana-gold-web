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
    maxQty: 9,
    discountPercent: 0,
    description: "Standard single / family snacking packs.",
  },
  {
    id: 2,
    name: "Pantry Bulk",
    badge: "15% OFF",
    minQty: 10,
    maxQty: 49,
    discountPercent: 15,
    description: "Ideal for offices, gym buddies, and bulk pantry refills.",
  },
  {
    id: 3,
    name: "Retailer Wholesale",
    badge: "25% OFF",
    minQty: 50,
    maxQty: 199,
    discountPercent: 25,
    description: "Wholesale carton supply for grocery stores and boutique cafes.",
  },
  {
    id: 4,
    name: "Super Distributor",
    badge: "35% OFF",
    minQty: 200,
    maxQty: null,
    discountPercent: 35,
    description: "Direct master distributor supply & institutional procurement.",
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
