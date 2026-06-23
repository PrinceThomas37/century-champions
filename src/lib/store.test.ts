import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let tmpFile: string;

beforeEach(async () => {
  tmpFile = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), "cc-test-")),
    "db.json",
  );
  process.env.CC_DB_PATH = tmpFile;
  const { resetDb } = await import("./store");
  resetDb();
});

afterEach(() => {
  try {
    fs.rmSync(path.dirname(tmpFile), { recursive: true, force: true });
  } catch {
    /* ignore */
  }
  delete process.env.CC_DB_PATH;
});

describe("store", () => {
  it("seeds an initial dashboard sorted by lifetime points", async () => {
    const { getDashboard } = await import("./store");
    const d = getDashboard();
    expect(d.contractors.length).toBeGreaterThan(0);
    expect(d.rewards.length).toBeGreaterThan(0);
    for (let i = 1; i < d.contractors.length; i++) {
      expect(d.contractors[i - 1].lifetimePoints).toBeGreaterThanOrEqual(
        d.contractors[i].lifetimePoints,
      );
    }
  });

  it("enrolls a contractor starting at Bronze with zero points", async () => {
    const { addContractor, getDashboard } = await import("./store");
    const created = addContractor({ name: "Apex Steel", company: "Apex Inc." });
    expect(created.tier).toBe("Bronze");
    expect(created.points).toBe(0);
    const found = getDashboard().contractors.find((c) => c.id === created.id);
    expect(found?.name).toBe("Apex Steel");
  });

  it("rejects a contractor with a blank name", async () => {
    const { addContractor, ValidationError } = await import("./store");
    expect(() => addContractor({ name: "  ", company: "X" })).toThrow(
      ValidationError,
    );
  });

  it("awards points and updates balance, lifetime, and tier", async () => {
    const { addContractor, awardPoints } = await import("./store");
    const c = addContractor({ name: "Rivet Co", company: "Rivet" });
    const updated = awardPoints({
      contractorId: c.id,
      amount: 600,
      reason: "First order",
    });
    expect(updated.points).toBe(600);
    expect(updated.lifetimePoints).toBe(600);
    expect(updated.tier).toBe("Silver");
  });

  it("rejects non-positive point awards", async () => {
    const { addContractor, awardPoints, ValidationError } = await import(
      "./store"
    );
    const c = addContractor({ name: "Rivet Co", company: "Rivet" });
    expect(() =>
      awardPoints({ contractorId: c.id, amount: 0, reason: "x" }),
    ).toThrow(ValidationError);
  });

  it("redeems a reward and deducts the balance without changing lifetime", async () => {
    const { addContractor, awardPoints, redeemReward, getDashboard } =
      await import("./store");
    const c = addContractor({ name: "Forge LLC", company: "Forge" });
    awardPoints({ contractorId: c.id, amount: 1000, reason: "Big job" });
    const reward = getDashboard().rewards.find((r) => r.cost === 500)!;
    const { contractor, redemption } = redeemReward({
      contractorId: c.id,
      rewardId: reward.id,
    });
    expect(contractor.points).toBe(500);
    expect(contractor.lifetimePoints).toBe(1000);
    expect(redemption.cost).toBe(500);
    expect(getDashboard().stats.totalRedemptions).toBe(1);
  });

  it("blocks redemption when the balance is too low", async () => {
    const { addContractor, redeemReward, getDashboard, ValidationError } =
      await import("./store");
    const c = addContractor({ name: "Broke Co", company: "Broke" });
    const reward = getDashboard().rewards[0];
    expect(() =>
      redeemReward({ contractorId: c.id, rewardId: reward.id }),
    ).toThrow(ValidationError);
  });
});
