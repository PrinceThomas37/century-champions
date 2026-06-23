import { NextResponse } from "next/server";
import { z } from "zod";
import { issueOtp, isValidPhone, normalizePhone } from "@/lib/otp";
import { SmsError } from "@/lib/sms";

const schema = z.object({ phone: z.string() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const phone = normalizePhone(parsed.data.phone);
  if (!isValidPhone(phone))
    return NextResponse.json({ error: "Enter a valid 10-digit mobile number" }, { status: 400 });

  try {
    const { devCode } = await issueOtp(phone);
    return NextResponse.json({ ok: true, phone, devCode });
  } catch (err) {
    if (err instanceof SmsError) {
      console.error("OTP SMS failed:", err.message);
      return NextResponse.json(
        { error: "Couldn't send the code right now. Please try again in a moment." },
        { status: 502 },
      );
    }
    throw err;
  }
}
