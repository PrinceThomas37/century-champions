import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyOtp, isValidPhone, normalizePhone } from "@/lib/otp";
import { setContractorSession } from "@/lib/auth";

const schema = z.object({
  phone: z.string(),
  code: z.string(),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const phone = normalizePhone(parsed.data.phone);
  if (!isValidPhone(phone))
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });

  const ok = await verifyOtp(phone, parsed.data.code.trim());
  if (!ok) return NextResponse.json({ error: "Wrong or expired code" }, { status: 401 });

  // Upsert the contractor on first successful login.
  const contractor = await prisma.contractor.upsert({
    where: { phone },
    update: parsed.data.name ? { name: parsed.data.name } : {},
    create: { phone, name: parsed.data.name },
  });

  setContractorSession(contractor.id);
  return NextResponse.json({ ok: true, isNew: !contractor.name });
}
