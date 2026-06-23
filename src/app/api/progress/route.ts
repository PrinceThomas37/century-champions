import { NextResponse } from "next/server";
import { getContractorId } from "@/lib/auth";
import { getProgress } from "@/lib/champions";

export async function GET() {
  const contractorId = getContractorId();
  if (!contractorId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const progress = await getProgress(contractorId);
  return NextResponse.json(progress);
}
