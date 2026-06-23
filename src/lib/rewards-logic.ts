import type { Tier } from "./types";

/** Loyalty tiers ordered from highest to lowest threshold. */
export const TIER_THRESHOLDS: ReadonlyArray<{ tier: Tier; min: number }> = [
  { tier: "Platinum", min: 5000 },
  { tier: "Gold", min: 2000 },
  { tier: "Silver", min: 500 },
  { tier: "Bronze", min: 0 },
];

/** Determine the loyalty tier earned for a given lifetime points total. */
export function computeTier(lifetimePoints: number): Tier {
  for (const t of TIER_THRESHOLDS) {
    if (lifetimePoints >= t.min) return t.tier;
  }
  return "Bronze";
}

/**
 * Points still required to reach the next tier, or `null` if the contractor is
 * already at the highest tier.
 */
export function pointsToNextTier(lifetimePoints: number): number | null {
  const ascending = [...TIER_THRESHOLDS].sort((a, b) => a.min - b.min);
  const next = ascending.find((t) => t.min > lifetimePoints);
  return next ? next.min - lifetimePoints : null;
}

/** Whether a contractor with `balance` points can afford a reward costing `cost`. */
export function canRedeem(balance: number, cost: number): boolean {
  return Number.isFinite(cost) && cost > 0 && balance >= cost;
}
