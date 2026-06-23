import { NextResponse } from "next/server";
import { clearContractorSession } from "@/lib/auth";

export async function POST() {
  clearContractorSession();
  return NextResponse.json({ ok: true });
}
