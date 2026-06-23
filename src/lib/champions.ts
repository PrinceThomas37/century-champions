import { prisma } from "./db";
import { randomBytes } from "crypto";

// ---------------------------------------------------------------------------
// Serial normalisation
// ---------------------------------------------------------------------------

// Normalise contractor input so casing and stray spaces don't cause false
// rejections. Stored serials use an unambiguous alphabet (no 0/O/1/I), so we
// only need to uppercase, drop whitespace, and strip disallowed characters.
export function normalizeSerial(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "");
}

// ---------------------------------------------------------------------------
// Redeem a single serial — atomic
// ---------------------------------------------------------------------------

export type RedeemResult =
  | { ok: true; pointsEarned: number; productName: string }
  | { ok: false; reason: "not_found" | "already_used" | "void" | "own_already" };

export async function redeemSerial(contractorId: string, rawCode: string): Promise<RedeemResult> {
  const code = normalizeSerial(rawCode);

  return prisma.$transaction(async (tx) => {
    const serial = await tx.serial.findUnique({
      where: { code },
      include: { product: true, batch: true },
    });

    if (!serial) return { ok: false as const, reason: "not_found" as const };
    if (serial.status === "void" || serial.batch.voided)
      return { ok: false as const, reason: "void" as const };
    if (serial.status === "redeemed") {
      if (serial.redeemedBy === contractorId)
        return { ok: false as const, reason: "own_already" as const };
      return { ok: false as const, reason: "already_used" as const };
    }

    const points = serial.product.pointsPerPacket;

    // Atomic claim: only flip if still unused (guards against double-submit races).
    const claimed = await tx.serial.updateMany({
      where: { id: serial.id, status: "unused" },
      data: { status: "redeemed", redeemedBy: contractorId, redeemedAt: new Date() },
    });
    if (claimed.count === 0) return { ok: false as const, reason: "already_used" as const };

    await tx.redemption.create({
      data: { serialId: serial.id, contractorId, pointsEarned: points },
    });

    await tx.contractor.update({
      where: { id: contractorId },
      data: {
        lifetimePoints: { increment: points },
        lifetimePackets: { increment: 1 },
      },
    });

    return { ok: true as const, pointsEarned: points, productName: serial.product.name };
  });
}

// ---------------------------------------------------------------------------
// Chest opening — issue any newly-unlocked chests
// ---------------------------------------------------------------------------

function makeCoupon(): string {
  const bytes = randomBytes(6);
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alpha[bytes[i] % alpha.length];
  return `CC-${s}`;
}

// After points change, open any chests the contractor now qualifies for that
// haven't been opened yet. Returns the chests opened in this call (for the
// celebratory animation).
export async function openEligibleChests(contractorId: string) {
  const contractor = await prisma.contractor.findUnique({ where: { id: contractorId } });
  if (!contractor) return [];

  const tiers = await prisma.chestTier.findMany({
    where: { active: true, thresholdPoints: { lte: contractor.lifetimePoints } },
    orderBy: { thresholdPoints: "asc" },
  });

  const opened: { displayName: string; rewardValue: string; couponCode: string }[] = [];

  for (const tier of tiers) {
    const exists = await prisma.chestOpen.findUnique({
      where: { contractorId_chestTierId: { contractorId, chestTierId: tier.id } },
    });
    if (exists) continue;

    try {
      const open = await prisma.chestOpen.create({
        data: { contractorId, chestTierId: tier.id, couponCode: makeCoupon() },
      });
      opened.push({
        displayName: tier.displayName,
        rewardValue: tier.rewardValue,
        couponCode: open.couponCode,
      });
    } catch {
      // unique constraint race — chest already opened concurrently; ignore.
    }
  }

  return opened;
}

// ---------------------------------------------------------------------------
// Forward-looking progress — the treasure-hunt hero state
// ---------------------------------------------------------------------------

export type Progress = {
  lifetimePoints: number;
  lifetimePackets: number;
  nextChest: {
    displayName: string;
    rewardValue: string;
    thresholdPoints: number;
    pointsRemaining: number;
    percent: number; // progress from previous chest to this one
  } | null; // null => all chests unlocked
  allChestsOpened: boolean;
};

export async function getProgress(contractorId: string): Promise<Progress> {
  const contractor = await prisma.contractor.findUnique({ where: { id: contractorId } });
  const points = contractor?.lifetimePoints ?? 0;
  const packets = contractor?.lifetimePackets ?? 0;

  const tiers = await prisma.chestTier.findMany({
    where: { active: true },
    orderBy: { thresholdPoints: "asc" },
  });

  const next = tiers.find((t) => t.thresholdPoints > points);
  if (!next) {
    return {
      lifetimePoints: points,
      lifetimePackets: packets,
      nextChest: null,
      allChestsOpened: tiers.length > 0,
    };
  }

  // Progress measured from the previously cleared threshold to the next one,
  // so the bar fills meaningfully between chests rather than from zero.
  const prevThreshold = tiers
    .filter((t) => t.thresholdPoints <= points)
    .reduce((max, t) => Math.max(max, t.thresholdPoints), 0);
  const span = next.thresholdPoints - prevThreshold;
  const into = points - prevThreshold;
  const percent = span > 0 ? Math.round((into / span) * 100) : 0;

  return {
    lifetimePoints: points,
    lifetimePackets: packets,
    nextChest: {
      displayName: next.displayName,
      rewardValue: next.rewardValue,
      thresholdPoints: next.thresholdPoints,
      pointsRemaining: next.thresholdPoints - points,
      percent,
    },
    allChestsOpened: false,
  };
}
