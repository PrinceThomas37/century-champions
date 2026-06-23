import { describe, expect, it } from "vitest";
import { normalizeSerial } from "../src/lib/champions";
import { isValidPhone, normalizePhone } from "../src/lib/otp";

describe("normalizeSerial", () => {
  it("uppercases and removes spaces", () => {
    expect(normalizeSerial("rvt aaaa bbbb")).toBe("RVTAAAABBBB");
  });

  it("preserves hyphens but strips other punctuation", () => {
    expect(normalizeSerial("rvt-aaaa-bbbb")).toBe("RVT-AAAA-BBBB");
    expect(normalizeSerial("RVT_AAAA.BBBB")).toBe("RVTAAAABBBB");
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeSerial("  rvt-aaaa  ")).toBe("RVT-AAAA");
  });
});

describe("normalizePhone", () => {
  it("keeps digits only", () => {
    expect(normalizePhone("+91 99999 99999")).toBe("9999999999");
    expect(normalizePhone("(999) 999-9999")).toBe("9999999999");
  });

  it("strips a leading 91 country code from a 12-digit number", () => {
    expect(normalizePhone("919876543210")).toBe("9876543210");
  });

  it("leaves a plain 10-digit number unchanged", () => {
    expect(normalizePhone("9876543210")).toBe("9876543210");
  });
});

describe("isValidPhone", () => {
  it("accepts Indian mobile numbers starting 6-9", () => {
    expect(isValidPhone("9876543210")).toBe(true);
    expect(isValidPhone("6000000000")).toBe(true);
  });

  it("rejects numbers that are the wrong length or start digit", () => {
    expect(isValidPhone("1234567890")).toBe(false); // starts with 1
    expect(isValidPhone("98765")).toBe(false); // too short
    expect(isValidPhone("98765432101")).toBe(false); // too long
  });
});
