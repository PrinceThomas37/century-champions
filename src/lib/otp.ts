import { prisma } from "./db";
import { randomInt } from "crypto";

const DEV_MODE = process.env.DEV_OTP_MODE !== "false";
const DEV_CODE = process.env.DEV_OTP_CODE || "123456";

export function normalizePhone(raw: string): string {
  // Keep digits only; strip a leading country code 91 if a 12-digit number is given.
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  return digits;
}

export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone); // Indian mobile number
}

// Issue an OTP. In dev mode we return the code so the tester can see it; in
// production this is where an SMS gateway (e.g. MSG91, Twilio) would be called.
export async function issueOtp(phone: string): Promise<{ devCode?: string }> {
  const code = DEV_MODE ? DEV_CODE : String(randomInt(100000, 1000000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.otpToken.create({ data: { phone, code, expiresAt } });

  if (!DEV_MODE) {
    // TODO: integrate SMS provider here.
    // await sendSms(phone, `Your Century Champions code is ${code}`);
  }

  return DEV_MODE ? { devCode: code } : {};
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const token = await prisma.otpToken.findFirst({
    where: { phone, code, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!token) return false;
  await prisma.otpToken.update({ where: { id: token.id }, data: { consumed: true } });
  return true;
}
