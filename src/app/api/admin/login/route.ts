import { NextResponse } from "next/server";
import { z } from "zod";
import { setAdminSession } from "@/lib/auth";

const schema = z.object({ password: z.string() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const expected = process.env.ADMIN_PASSWORD || "century-admin";
  if (parsed.data.password !== expected)
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });

  setAdminSession();
  return NextResponse.json({ ok: true });
}
