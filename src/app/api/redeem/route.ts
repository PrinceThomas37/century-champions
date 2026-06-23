import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getContractorId } from "@/lib/auth";
import { redeemSerial, openEligibleChests, getProgress } from "@/lib/champions";

const schema = z.object({ serial: z.string().min(1) });

// Anti-fraud: cap redemptions per contractor per day. Covers very large
// purchases while blocking abuse.
const DAILY_LIMIT = 80;

const REASON_MESSAGES: Record<string, string> = {
  not_found: "We couldn't find that code. Check for typos and try again.",
  already_used: "This code has already been used.",
  own_already: "You've already added this code.",
  void: "This code is no longer valid.",
};

export async function POST(req: Request) {
  const contractorId = getContractorId();
  if (!contractorId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  // Rate limit
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await prisma.redemption.count({
    where: { contractorId, createdAt: { gt: since } },
  });
  if (recent >= DAILY_LIMIT)
    return NextResponse.json(
      { error: "Daily limit reached. Please try again tomorrow." },
      { status: 429 }
    );

  const result = await redeemSerial(contractorId, parsed.data.serial);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, reason: result.reason, message: REASON_MESSAGES[result.reason] },
      { status: 200 }
    );
  }

  // Open any chests this redemption unlocked, then return forward-looking state.
  const chestsOpened = await openEligibleChests(contractorId);
  const progress = await getProgress(contractorId);

  return NextResponse.json({
    ok: true,
    pointsEarned: result.pointsEarned,
    productName: result.productName,
    chestsOpened,
    progress,
  });
}
