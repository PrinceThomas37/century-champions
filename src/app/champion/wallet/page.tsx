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
    <main className="mx-auto min-h-screen max-w-md bg-steel-50 pb-24">
      <header className="flex items-center justify-between bg-ink px-5 py-4">
        <Link href="/champion" className="text-sm font-semibold text-white/80">
          ← Back
        </Link>
        <h1 className="text-sm font-bold uppercase tracking-wide text-white">My Rewards</h1>
        <span className="w-12" />
      </header>

      <div className="px-5 pt-5">
        {opens.length === 0 ? (
          <div className="mt-16 text-center text-steel-500">
            <p className="text-base font-bold text-ink">No rewards unlocked yet</p>
            <p className="mt-1 text-sm">Keep entering codes to unlock your first reward.</p>
            <Link href="/champion/scan" className="btn-primary mt-6">
              Enter codes
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {opens.map((o) => (
              <li key={o.id} className="rounded-xl border border-steel-200 bg-white p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-ink">{o.chestTier.displayName}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      o.claimStatus === "claimed"
                        ? "bg-steel-100 text-steel-500"
                        : "bg-century-redSoft text-century-redDark"
                    }`}
                  >
                    {o.claimStatus === "claimed" ? "Claimed" : "Ready"}
                  </span>
                </div>
                <p className="mt-1 font-semibold text-century-red">{o.chestTier.rewardValue}</p>
                <div className="mt-3 rounded-lg border border-dashed border-steel-300 bg-steel-50 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-steel-400">Coupon code</p>
                  <p className="font-mono text-lg font-bold tracking-wider text-ink">
                    {o.couponCode}
                  </p>
                </div>
                {o.claimStatus !== "claimed" && (
                  <p className="mt-2 text-center text-xs text-steel-400">
                    Show this code at the Century Steel counter to claim.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <BottomNav active="/champion/wallet" />
    </main>
  );
}
