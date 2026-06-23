import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  Contractor,
  ContractorView,
  DbState,
  Redemption,
} from "./types";
import { canRedeem, computeTier, pointsToNextTier } from "./rewards-logic";

function dbPath(): string {
  return process.env.CC_DB_PATH || path.join(process.cwd(), "data", "db.json");
}

function seed(): DbState {
  const now = new Date().toISOString();
  const contractors: Contractor[] = [
    {
      id: "c-ace",
      name: "Ace Welding Co.",
      company: "Ace Welding",
      points: 3200,
      lifetimePoints: 6400,
      createdAt: now,
    },
    {
      id: "c-summit",
      name: "Summit Fabricators",
      company: "Summit Fab",
      points: 1100,
      lifetimePoints: 2300,
      createdAt: now,
    },
    {
      id: "c-ironclad",
      name: "Ironclad Builders",
      company: "Ironclad",
      points: 420,
      lifetimePoints: 720,
      createdAt: now,
    },
  ];

  const rewards = [
    {
      id: "r-jacket",
      name: "Century Steels Jacket",
      description: "Branded all-weather work jacket.",
      cost: 500,
    },
    {
      id: "r-toolset",
      name: "Pro Tool Set",
      description: "32-piece contractor-grade tool set.",
      cost: 1500,
    },
    {
      id: "r-giftcard",
      name: "$250 Gift Card",
      description: "Redeemable at any major hardware retailer.",
      cost: 2500,
    },
    {
      id: "r-getaway",
      name: "Weekend Getaway",
      description: "Two-night stay for the whole crew.",
      cost: 5000,
    },
  ];

  return { contractors, rewards, pointEntries: [], redemptions: [] };
}

function load(): DbState {
  const p = dbPath();
  if (!fs.existsSync(p)) {
    const fresh = seed();
    persist(fresh);
    return fresh;
  }
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as DbState;
  } catch {
    const fresh = seed();
    persist(fresh);
    return fresh;
  }
}

function persist(state: DbState): void {
  const p = dbPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(state, null, 2));
}

function toView(c: Contractor): ContractorView {
  return {
    ...c,
    tier: computeTier(c.lifetimePoints),
    pointsToNextTier: pointsToNextTier(c.lifetimePoints),
  };
}

export interface Dashboard {
  contractors: ContractorView[];
  rewards: DbState["rewards"];
  redemptions: Redemption[];
  stats: {
    totalContractors: number;
    totalPointsAwarded: number;
    totalRedemptions: number;
    pointsOutstanding: number;
  };
}

export function getDashboard(): Dashboard {
  const state = load();
  const contractors = [...state.contractors]
    .map(toView)
    .sort((a, b) => b.lifetimePoints - a.lifetimePoints);

  return {
    contractors,
    rewards: state.rewards,
    redemptions: [...state.redemptions].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),
    stats: {
      totalContractors: state.contractors.length,
      totalPointsAwarded: state.contractors.reduce(
        (s, c) => s + c.lifetimePoints,
        0,
      ),
      totalRedemptions: state.redemptions.length,
      pointsOutstanding: state.contractors.reduce((s, c) => s + c.points, 0),
    },
  };
}

export function addContractor(input: {
  name: string;
  company: string;
}): ContractorView {
  const name = input.name?.trim();
  const company = input.company?.trim();
  if (!name) throw new ValidationError("Contractor name is required.");
  if (!company) throw new ValidationError("Company is required.");

  const state = load();
  const contractor: Contractor = {
    id: randomUUID(),
    name,
    company,
    points: 0,
    lifetimePoints: 0,
    createdAt: new Date().toISOString(),
  };
  state.contractors.push(contractor);
  persist(state);
  return toView(contractor);
}

export function awardPoints(input: {
  contractorId: string;
  amount: number;
  reason: string;
}): ContractorView {
  const amount = Math.round(Number(input.amount));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ValidationError("Points awarded must be a positive number.");
  }
  const reason = input.reason?.trim() || "Manual award";

  const state = load();
  const contractor = state.contractors.find((c) => c.id === input.contractorId);
  if (!contractor) throw new NotFoundError("Contractor not found.");

  contractor.points += amount;
  contractor.lifetimePoints += amount;
  state.pointEntries.push({
    id: randomUUID(),
    contractorId: contractor.id,
    amount,
    reason,
    createdAt: new Date().toISOString(),
  });
  persist(state);
  return toView(contractor);
}

export function redeemReward(input: {
  contractorId: string;
  rewardId: string;
}): { contractor: ContractorView; redemption: Redemption } {
  const state = load();
  const contractor = state.contractors.find((c) => c.id === input.contractorId);
  if (!contractor) throw new NotFoundError("Contractor not found.");
  const reward = state.rewards.find((r) => r.id === input.rewardId);
  if (!reward) throw new NotFoundError("Reward not found.");

  if (!canRedeem(contractor.points, reward.cost)) {
    throw new ValidationError(
      `Not enough points. ${contractor.name} has ${contractor.points}, needs ${reward.cost}.`,
    );
  }

  contractor.points -= reward.cost;
  const redemption: Redemption = {
    id: randomUUID(),
    contractorId: contractor.id,
    rewardId: reward.id,
    rewardName: reward.name,
    cost: reward.cost,
    createdAt: new Date().toISOString(),
  };
  state.redemptions.push(redemption);
  persist(state);
  return { contractor: toView(contractor), redemption };
}

/** Test helper: wipe the database back to seed state. */
export function resetDb(): void {
  persist(seed());
}

export class ValidationError extends Error {}
export class NotFoundError extends Error {}
