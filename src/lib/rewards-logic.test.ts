import { describe, expect, it } from "vitest";
import { canRedeem, computeTier, pointsToNextTier } from "./rewards-logic";

describe("computeTier", () => {
  it("maps lifetime points to the correct tier", () => {
    expect(computeTier(0)).toBe("Bronze");
    expect(computeTier(499)).toBe("Bronze");
    expect(computeTier(500)).toBe("Silver");
    expect(computeTier(2000)).toBe("Gold");
    expect(computeTier(5000)).toBe("Platinum");
    expect(computeTier(99999)).toBe("Platinum");
  });
});

describe("pointsToNextTier", () => {
  it("returns points remaining to the next tier", () => {
    expect(pointsToNextTier(0)).toBe(500);
    expect(pointsToNextTier(500)).toBe(1500);
  });

  it("returns null at the highest tier", () => {
    expect(pointsToNextTier(5000)).toBeNull();
  });
});

describe("canRedeem", () => {
  it("allows redemption only with a sufficient balance", () => {
    expect(canRedeem(500, 500)).toBe(true);
    expect(canRedeem(499, 500)).toBe(false);
  });

  it("rejects non-positive costs", () => {
    expect(canRedeem(100, 0)).toBe(false);
    expect(canRedeem(100, -10)).toBe(false);
  });
});
