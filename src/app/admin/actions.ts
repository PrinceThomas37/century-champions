"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { normalizeSerial } from "@/lib/champions";

export async function createProduct(formData: FormData) {
  requireAdmin();
  const sku = String(formData.get("sku") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim() || null;
  const pointsPerPacket = Number(formData.get("pointsPerPacket") || 1);
  if (!sku || !name) return;

  await prisma.product.create({
    data: { sku, name, category, pointsPerPacket: Math.max(1, pointsPerPacket) },
  });
  revalidatePath("/admin/products");
}

// Import serials for a product. Accepts either:
//  - a generated count (system makes random unambiguous serials), or
//  - a pasted list (one serial per line, e.g. exported from the factory).
export async function importSerials(formData: FormData) {
  requireAdmin();
  const productId = String(formData.get("productId") || "");
  const batchCode = String(formData.get("batchCode") || "").trim();
  const pasted = String(formData.get("serials") || "").trim();
  const generateCount = Number(formData.get("generateCount") || 0);
  if (!productId || !batchCode) return;

  const existing = await prisma.batch.findUnique({ where: { code: batchCode } });
  if (existing) return; // batch codes must be unique

  let codes: string[] = [];
  if (pasted) {
    codes = pasted
      .split(/[\r\n,]+/)
      .map((c) => normalizeSerial(c))
      .filter(Boolean);
  } else if (generateCount > 0) {
    const { randomBytes } = await import("crypto");
    const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const prefix = batchCode.replace(/[^A-Z0-9]/gi, "").slice(0, 3).toUpperCase() || "CC";
    const set = new Set<string>();
    while (set.size < generateCount) {
      const b = randomBytes(8);
      let s = "";
      for (let i = 0; i < 8; i++) s += ALPHABET[b[i] % ALPHABET.length];
      set.add(`${prefix}-${s.slice(0, 4)}-${s.slice(4, 8)}`);
    }
    codes = [...set];
  }

  // De-duplicate within the input, then drop any codes that already exist in the
  // database (guards against a pasted/generated code colliding with a prior serial).
  // SQLite doesn't support createMany skipDuplicates, so we pre-filter explicitly.
  codes = [...new Set(codes)];
  if (codes.length === 0) return;

  const clashes = await prisma.serial.findMany({
    where: { code: { in: codes } },
    select: { code: true },
  });
  const taken = new Set(clashes.map((c) => c.code));
  codes = codes.filter((c) => !taken.has(c));
  if (codes.length === 0) return;

  const batch = await prisma.batch.create({
    data: { code: batchCode, productId, quantity: codes.length },
  });

  await prisma.serial.createMany({
    data: codes.map((code) => ({ code, productId, batchId: batch.id })),
  });

  revalidatePath("/admin/serials");
}

export async function voidBatch(formData: FormData) {
  requireAdmin();
  const batchId = String(formData.get("batchId") || "");
  if (!batchId) return;
  await prisma.batch.update({ where: { id: batchId }, data: { voided: true } });
  await prisma.serial.updateMany({
    where: { batchId, status: "unused" },
    data: { status: "void" },
  });
  revalidatePath("/admin/serials");
}

export async function createChest(formData: FormData) {
  requireAdmin();
  const displayName = String(formData.get("displayName") || "").trim();
  const thresholdPoints = Number(formData.get("thresholdPoints") || 0);
  const rewardType = String(formData.get("rewardType") || "discount");
  const rewardValue = String(formData.get("rewardValue") || "").trim();
  if (!displayName || !rewardValue || thresholdPoints <= 0) return;

  await prisma.chestTier.create({
    data: { displayName, thresholdPoints, rewardType, rewardValue, sortOrder: thresholdPoints },
  });
  revalidatePath("/admin/chests");
}

export async function toggleChest(formData: FormData) {
  requireAdmin();
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "true";
  if (!id) return;
  await prisma.chestTier.update({ where: { id }, data: { active: !active } });
  revalidatePath("/admin/chests");
}

export async function markCouponClaimed(formData: FormData) {
  requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.chestOpen.update({
    where: { id },
    data: { claimStatus: "claimed", claimedAt: new Date() },
  });
  revalidatePath("/admin/redemptions");
}
