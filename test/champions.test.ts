import { afterAll, beforeEach, expect, it } from "vitest";
import { prisma } from "../src/lib/db";
import {
  getProgress,
  openEligibleChests,
  redeemSerial,
} from "../src/lib/champions";
import {
  describeDb,
  makeChests,
  makeContractor,
  makeSerial,
  resetDb,
} from "./helpers";

describeDb("redeemSerial", () => {
  beforeEach(resetDb);
  afterAll(() => prisma.$disconnect());

  it("redeems an unused serial and credits the contractor", async () => {
    const { serial, product } = await makeSerial({ code: "RVT-AAAA-BBBB" });
    const contractor = await makeContractor();

    const result = await redeemSerial(contractor.id, "RVT-AAAA-BBBB");

    expect(result).toEqual({
      ok: true,
      pointsEarned: product.pointsPerPacket,
      productName: product.name,
    });

    const after = await prisma.contractor.findUnique({
      where: { id: contractor.id },
    });
    expect(after?.lifetimePoints).toBe(1);
    expect(after?.lifetimePackets).toBe(1);

    const redeemed = await prisma.serial.findUnique({
      where: { id: serial.id },
    });
    expect(redeemed?.status).toBe("redeemed");
    expect(redeemed?.redeemedBy).toBe(contractor.id);

    expect(await prisma.redemption.count()).toBe(1);
  });

  it("normalizes contractor input (case + whitespace) before matching", async () => {
    await makeSerial({ code: "RVT-AAAA-BBBB" });
    const contractor = await makeContractor();

    // Lowercased and padded — normalizeSerial uppercases and trims, so this
    // still matches. (Spaces are stripped but no hyphens are inserted.)
    const result = await redeemSerial(contractor.id, "  rvt-aaaa-bbbb  ");

    expect(result.ok).toBe(true);
  });

  it("credits premium products their full points-per-packet", async () => {
    await makeSerial({ code: "FCC-PREM-0001", pointsPerPacket: 2 });
    const contractor = await makeContractor();

    const result = await redeemSerial(contractor.id, "FCC-PREM-0001");

    expect(result).toMatchObject({ ok: true, pointsEarned: 2 });
    const after = await prisma.contractor.findUnique({
      where: { id: contractor.id },
    });
    expect(after?.lifetimePoints).toBe(2);
    expect(after?.lifetimePackets).toBe(1); // one packet, worth two points
  });

  it("returns not_found for an unknown code", async () => {
    const contractor = await makeContractor();
    const result = await redeemSerial(contractor.id, "NOPE-0000-0000");
    expect(result).toEqual({ ok: false, reason: "not_found" });
  });

  it("returns own_already when the same contractor re-enters a code", async () => {
    await makeSerial({ code: "RVT-AAAA-BBBB" });
    const contractor = await makeContractor();

    await redeemSerial(contractor.id, "RVT-AAAA-BBBB");
    const second = await redeemSerial(contractor.id, "RVT-AAAA-BBBB");

    expect(second).toEqual({ ok: false, reason: "own_already" });
    expect(await prisma.redemption.count()).toBe(1); // not double-counted
  });

  it("returns already_used when another contractor claimed the code", async () => {
    await makeSerial({ code: "RVT-AAAA-BBBB" });
    const first = await makeContractor();
    const second = await makeContractor();

    await redeemSerial(first.id, "RVT-AAAA-BBBB");
    const result = await redeemSerial(second.id, "RVT-AAAA-BBBB");

    expect(result).toEqual({ ok: false, reason: "already_used" });
  });

  it("rejects a serial marked void", async () => {
    const { serial } = await makeSerial({ code: "RVT-VOID-0001" });
    await prisma.serial.update({
      where: { id: serial.id },
      data: { status: "void" },
    });
    const contractor = await makeContractor();

    const result = await redeemSerial(contractor.id, "RVT-VOID-0001");
    expect(result).toEqual({ ok: false, reason: "void" });
  });

  it("rejects a serial from a voided batch", async () => {
    const { batch } = await makeSerial({ code: "RVT-BVOID-001" });
    await prisma.batch.update({
      where: { id: batch.id },
      data: { voided: true },
    });
    const contractor = await makeContractor();

    const result = await redeemSerial(contractor.id, "RVT-BVOID-001");
    expect(result).toEqual({ ok: false, reason: "void" });
  });
});

describeDb("openEligibleChests", () => {
  beforeEach(resetDb);
  afterAll(() => prisma.$disconnect());

  it("opens every chest at or below the contractor's points, with coupons", async () => {
    await makeChests();
    const contractor = await makeContractor(60); // clears Bronze (20) and Silver (50)

    const opened = await openEligibleChests(contractor.id);

    expect(opened.map((o) => o.displayName)).toEqual([
      "Bronze Chest",
      "Silver Chest",
    ]);
    for (const o of opened) {
      expect(o.couponCode).toMatch(/^CC-[A-Z2-9]{6}$/);
    }
    expect(await prisma.chestOpen.count()).toBe(2);
  });

  it("is idempotent — re-running opens nothing new", async () => {
    await makeChests();
    const contractor = await makeContractor(60);

    await openEligibleChests(contractor.id);
    const again = await openEligibleChests(contractor.id);

    expect(again).toEqual([]);
    expect(await prisma.chestOpen.count()).toBe(2);
  });

  it("does not open chests above the contractor's points", async () => {
    await makeChests();
    const contractor = await makeContractor(20); // exactly Bronze only

    const opened = await openEligibleChests(contractor.id);
    expect(opened.map((o) => o.displayName)).toEqual(["Bronze Chest"]);
  });
});

describeDb("getProgress", () => {
  beforeEach(resetDb);
  afterAll(() => prisma.$disconnect());

  it("points to the next chest and fills the bar from the previous threshold", async () => {
    await makeChests();
    const contractor = await makeContractor(35); // between Bronze(20) and Silver(50)

    const progress = await getProgress(contractor.id);

    expect(progress.allChestsOpened).toBe(false);
    expect(progress.nextChest).toMatchObject({
      displayName: "Silver Chest",
      thresholdPoints: 50,
      pointsRemaining: 15,
      percent: 50, // (35-20) / (50-20)
    });
  });

  it("measures the first chest from zero", async () => {
    await makeChests();
    const contractor = await makeContractor(5);

    const progress = await getProgress(contractor.id);
    expect(progress.nextChest).toMatchObject({
      displayName: "Bronze Chest",
      pointsRemaining: 15,
      percent: 25, // 5 / 20
    });
  });

  it("reports all chests opened once past the top threshold", async () => {
    await makeChests();
    const contractor = await makeContractor(120);

    const progress = await getProgress(contractor.id);
    expect(progress.nextChest).toBeNull();
    expect(progress.allChestsOpened).toBe(true);
  });
});

describeDb("redeem → open → progress flow", () => {
  beforeEach(resetDb);
  afterAll(() => prisma.$disconnect());

  it("a redemption that crosses a threshold opens that chest", async () => {
    await prisma.chestTier.create({
      data: { displayName: "Bronze Chest", thresholdPoints: 1, rewardValue: "₹200" },
    });
    await makeSerial({ code: "RVT-AAAA-BBBB" });
    const contractor = await makeContractor();

    const redeem = await redeemSerial(contractor.id, "RVT-AAAA-BBBB");
    expect(redeem.ok).toBe(true);

    const opened = await openEligibleChests(contractor.id);
    expect(opened).toHaveLength(1);

    const progress = await getProgress(contractor.id);
    expect(progress.lifetimePoints).toBe(1);
    expect(progress.allChestsOpened).toBe(true);
  });
});
