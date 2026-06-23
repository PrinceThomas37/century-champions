import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

// Generate a non-guessable, human-typable alphanumeric serial.
// Avoids ambiguous characters (0/O, 1/I) to reduce contractor typos.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeSerial(prefix: string): string {
  const bytes = randomBytes(8);
  let s = "";
  for (let i = 0; i < 8; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return `${prefix}-${s.slice(0, 4)}-${s.slice(4, 8)}`;
}

async function main() {
  console.log("Seeding Century Champions sample data…");

  // ---- Products (hero products for the pilot) ----
  const rivet = await prisma.product.upsert({
    where: { sku: "CS-RVT-08" },
    update: {},
    create: {
      sku: "CS-RVT-08",
      name: "Century Steel Rivet 8mm",
      category: "rivet",
      pointsPerPacket: 1,
    },
  });

  const bolt = await prisma.product.upsert({
    where: { sku: "CS-BLT-10" },
    update: {},
    create: {
      sku: "CS-BLT-10",
      name: "Century Steel Bolt 10mm",
      category: "bolt",
      pointsPerPacket: 1,
    },
  });

  const connector = await prisma.product.upsert({
    where: { sku: "CS-FCC-PRO" },
    update: {},
    create: {
      sku: "CS-FCC-PRO",
      name: "False-Ceiling Connector (Pro)",
      category: "false-ceiling-connector",
      pointsPerPacket: 2, // premium product counts double toward chests
    },
  });

  // ---- Treasure chests (cumulative lifetime tiers) ----
  const chests = [
    { displayName: "Bronze Chest", thresholdPoints: 20, rewardType: "discount", rewardValue: "₹200 off next order", sortOrder: 1 },
    { displayName: "Silver Chest", thresholdPoints: 50, rewardType: "gift", rewardValue: "Century tool kit", sortOrder: 2 },
    { displayName: "Gold Chest", thresholdPoints: 100, rewardType: "cashback", rewardValue: "₹1,000 cashback", sortOrder: 3 },
  ];
  for (const c of chests) {
    await prisma.chestTier.upsert({
      where: { id: `seed-${c.sortOrder}` },
      update: { ...c },
      create: { id: `seed-${c.sortOrder}`, ...c },
    });
  }

  // ---- A sample batch of serials per product (small, for testing) ----
  async function makeBatch(productId: string, prefix: string, code: string, qty: number) {
    const existing = await prisma.batch.findUnique({ where: { code } });
    if (existing) {
      console.log(`Batch ${code} already exists, skipping.`);
      return;
    }
    const batch = await prisma.batch.create({
      data: { code, productId, quantity: qty },
    });
    const data = Array.from({ length: qty }, () => ({
      code: makeSerial(prefix),
      productId,
      batchId: batch.id,
    }));
    await prisma.serial.createMany({ data });
    console.log(`Created batch ${code} with ${qty} serials.`);

    // Print a few example serials so they're easy to test with.
    const samples = await prisma.serial.findMany({ where: { batchId: batch.id }, take: 5 });
    console.log(`  Sample serials: ${samples.map((s) => s.code).join(", ")}`);
  }

  await makeBatch(rivet.id, "RVT", "2026-06-RVT-A", 50);
  await makeBatch(bolt.id, "BLT", "2026-06-BLT-A", 50);
  await makeBatch(connector.id, "FCC", "2026-06-FCC-A", 30);

  // ---- A demo contractor for quick login testing ----
  await prisma.contractor.upsert({
    where: { phone: "9999999999" },
    update: {},
    create: {
      phone: "9999999999",
      name: "Demo Contractor",
      business: "Demo Constructions",
      region: "Kerala",
    },
  });

  console.log("\nDone. Demo login phone: 9999999999 (use the dev OTP code).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
