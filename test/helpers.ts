import { describe } from "vitest";
import { prisma } from "../src/lib/db";

/** True when a throwaway Postgres database is configured for integration tests. */
export const dbReady = !!process.env.TEST_DATABASE_URL;

/** `describe` for DB-backed suites; skipped automatically when no test DB exists. */
export const describeDb = dbReady ? describe : describe.skip;

/** Wipe every table so each test starts from a clean slate. */
export async function resetDb(): Promise<void> {
  await prisma.$executeRawUnsafe(
    `TRUNCATE "ChestOpen","Redemption","Serial","Batch","ChestTier","OtpToken","Product","Contractor" RESTART IDENTITY CASCADE`,
  );
}

/** Create a product, a (non-void) batch, and a single unused serial for it. */
export async function makeSerial(opts?: {
  code?: string;
  pointsPerPacket?: number;
}) {
  const code = opts?.code ?? `RVT-AAAA-BBBB`;
  const product = await prisma.product.create({
    data: {
      sku: `SKU-${Math.random().toString(36).slice(2, 8)}`,
      name: "Test Rivet",
      pointsPerPacket: opts?.pointsPerPacket ?? 1,
    },
  });
  const batch = await prisma.batch.create({
    data: {
      code: `BATCH-${Math.random().toString(36).slice(2, 8)}`,
      productId: product.id,
      quantity: 1,
    },
  });
  const serial = await prisma.serial.create({
    data: { code, productId: product.id, batchId: batch.id },
  });
  return { product, batch, serial };
}

/** Create a contractor with a unique phone number. */
export async function makeContractor(lifetimePoints = 0) {
  const phone = String(9000000000 + Math.floor(Math.random() * 999999999));
  return prisma.contractor.create({
    data: { phone, name: "Test Champion", lifetimePoints },
  });
}

/** Create the standard 20/50/100 chest tiers used by several tests. */
export async function makeChests() {
  await prisma.chestTier.createMany({
    data: [
      { displayName: "Bronze Chest", thresholdPoints: 20, rewardValue: "₹200" },
      { displayName: "Silver Chest", thresholdPoints: 50, rewardValue: "Kit" },
      { displayName: "Gold Chest", thresholdPoints: 100, rewardValue: "₹1000" },
    ],
  });
}
