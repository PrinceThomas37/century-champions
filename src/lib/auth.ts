import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";

// Lightweight signed-cookie sessions. No external dependency; good enough for the
// MVP pilot. Swap for Supabase Auth / NextAuth before production scale.

const CONTRACTOR_COOKIE = "cc_session";
const ADMIN_COOKIE = "cc_admin";

function secret(): string {
  return process.env.SESSION_SECRET || "dev-secret-change-me";
}

function sign(value: string): string {
  const sig = createHmac("sha256", secret()).update(value).digest("base64url");
  return `${value}.${sig}`;
}

function verify(signed: string | undefined): string | null {
  if (!signed) return null;
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = createHmac("sha256", secret()).update(value).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
    return value;
  } catch {
    return null;
  }
}

// ---- Contractor session ----

export function setContractorSession(contractorId: string) {
  cookies().set(CONTRACTOR_COOKIE, sign(contractorId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 days
  });
}

export function getContractorId(): string | null {
  return verify(cookies().get(CONTRACTOR_COOKIE)?.value);
}

export function clearContractorSession() {
  cookies().delete(CONTRACTOR_COOKIE);
}

// ---- Admin session ----

export function setAdminSession() {
  cookies().set(ADMIN_COOKIE, sign("admin"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
}

export function isAdmin(): boolean {
  return verify(cookies().get(ADMIN_COOKIE)?.value) === "admin";
}

export function clearAdminSession() {
  cookies().delete(ADMIN_COOKIE);
}

// Use at the top of any protected admin page/server action.
export function requireAdmin() {
  if (!isAdmin()) redirect("/admin/login");
}
