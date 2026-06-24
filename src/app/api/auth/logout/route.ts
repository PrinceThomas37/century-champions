import { NextResponse } from "next/server";
import { clearContractorSession } from "@/lib/auth";

export async function POST(req: Request) {
  clearContractorSession();
  // 303 (See Other) so the browser follows with a GET to the login page.
  return NextResponse.redirect(new URL("/champion/login", req.url), 303);
}
