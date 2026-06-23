import Link from "next/link";
import { redirect } from "next/navigation";
import { getContractorId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BottomNav } from "@/components/BottomNav";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const contractorId = getContractorId();
  if (!contractorId) redirect("/champion/login");

  const opens = await prisma.chestOpen.findMany({
    where: { contractorId },
    include: { chestTier: true },
    orderBy: { openedAt: "desc" },
  });

  return (
    <main className="mx-auto min-h-screen max-w-md bg-steel-50 px-5 pb-24 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/champion" className="text-sm text-steel-700">
          ← Back
        </Link>
        <h1 className="text-lg font-bold">My Rewards</h1>
        <span className="w-10" />
      </div>

      {opens.length === 0 ? (
        <div className="mt-16 text-center text-steel-700/70">
          <p className="text-5xl">🗺️</p>
          <p className="mt-4 font-semibold">No chests opened yet</p>
          <p className="mt-1 text-sm">Keep entering codes to unlock your first treasure chest!</p>
          <Link
            href="/champion/scan"
            className="mt-6 inline-block rounded-xl bg-champion px-6 py-3 font-bold text-white"
          >
            Enter codes
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {opens.map((o) => (
            <li key={o.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">{o.chestTier.displayName}</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    o.claimStatus === "claimed"
                      ? "bg-steel-100 text-steel-700"
                      : "bg-treasure-gold/20 text-treasure-deep"
                  }`}
                >
                  {o.claimStatus === "claimed" ? "Claimed" : "Ready to claim"}
                </span>
              </div>
              <p className="mt-1 text-champion-dark">{o.chestTier.rewardValue}</p>
              <div className="mt-3 rounded-xl border border-dashed border-steel-100 bg-steel-50 px-4 py-3 text-center">
                <p className="text-xs text-steel-700/60">Coupon code</p>
                <p className="font-mono text-lg font-bold tracking-wider">{o.couponCode}</p>
              </div>
              {o.claimStatus !== "claimed" && (
                <p className="mt-2 text-center text-xs text-steel-700/60">
                  Show this code at the Century Steels counter to claim.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <BottomNav active="/champion/wallet" />
    </main>
  );
}
