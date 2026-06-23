import { prisma } from "./db";
import { randomInt } from "crypto";
import { sendOtpSms } from "./sms";

const DEV_CODE = process.env.DEV_OTP_CODE || "123456";

// Read at call time (not module load) so tests and config changes take effect.
function isDevMode(): boolean {
  return process.env.DEV_OTP_MODE !== "false";
}

export function normalizePhone(raw: string): string {
  // Keep digits only; strip a leading country code 91 if a 12-digit number is given.
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  return digits;
}

export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone); // Indian mobile number
}

// Issue an OTP.
//   Dev mode  (DEV_OTP_MODE != "false"): no SMS sent; the fixed dev code is
//             returned so a tester can see it on screen.
//   Live mode (DEV_OTP_MODE == "false"): a random code is sent to the phone via
//             MSG91. We only persist the token once the SMS is accepted, so a
//             failed send never leaves a usable code behind. Throws on send
//             failure so the caller can show an error.
export async function issueOtp(phone: string): Promise<{ devCode?: string }> {
  const devMode = isDevMode();
  const code = devMode ? DEV_CODE : String(randomInt(100000, 1000000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  if (!devMode) {
    await sendOtpSms(phone, code); // throws SmsError on failure
  }

  await prisma.otpToken.create({ data: { phone, code, expiresAt } });

  return devMode ? { devCode: code } : {};
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
