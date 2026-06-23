export type Tier = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface Contractor {
  id: string;
  name: string;
  company: string;
  /** Current redeemable points balance. */
  points: number;
  /** Total points ever earned, used to determine the loyalty tier. */
  lifetimePoints: number;
  createdAt: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
}

export interface PointEntry {
  id: string;
  contractorId: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface Redemption {
  id: string;
  contractorId: string;
  rewardId: string;
  rewardName: string;
  cost: number;
  createdAt: string;
}

export interface DbState {
  contractors: Contractor[];
  rewards: Reward[];
  pointEntries: PointEntry[];
  redemptions: Redemption[];
}

/** A contractor enriched with derived fields for display. */
export interface ContractorView extends Contractor {
  tier: Tier;
  pointsToNextTier: number | null;
}
