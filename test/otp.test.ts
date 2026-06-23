import { afterAll, beforeEach, expect, it } from "vitest";
import { prisma } from "../src/lib/db";
import { issueOtp, verifyOtp } from "../src/lib/otp";
import { describeDb, resetDb } from "./helpers";

describeDb("OTP issue/verify", () => {
  beforeEach(resetDb);
  afterAll(() => prisma.$disconnect());

  it("issues a dev-mode OTP, stores it, and returns the dev code", async () => {
    const { devCode } = await issueOtp("9876543210");
    expect(devCode).toBe("123456");

    const token = await prisma.otpToken.findFirst({
      where: { phone: "9876543210" },
    });
    expect(token?.code).toBe("123456");
    expect(token?.consumed).toBe(false);
  });

  it("verifies a correct code exactly once (single-use)", async () => {
    await issueOtp("9876543210");

    expect(await verifyOtp("9876543210", "123456")).toBe(true);
    // Second attempt fails because the token is now consumed.
    expect(await verifyOtp("9876543210", "123456")).toBe(false);
  });

  it("rejects a wrong code", async () => {
    await issueOtp("9876543210");
    expect(await verifyOtp("9876543210", "000000")).toBe(false);
  });

  it("rejects an expired code", async () => {
    await prisma.otpToken.create({
      data: {
        phone: "9876543210",
        code: "654321",
        expiresAt: new Date(Date.now() - 60 * 1000), // already expired
      },
    });
    expect(await verifyOtp("9876543210", "654321")).toBe(false);
  });
});
