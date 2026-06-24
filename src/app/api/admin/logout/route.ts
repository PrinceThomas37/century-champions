import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/auth";

export async function POST(req: Request) {
  clearAdminSession();
  // 303 (See Other) makes the browser follow with a GET — a default 307 would
  // re-POST to the login page (which only handles GET) and show a broken page.
  return NextResponse.redirect(new URL("/admin/login", req.url), 303);
}
