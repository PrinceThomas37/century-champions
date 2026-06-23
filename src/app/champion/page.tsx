import Link from "next/link";
import { redirect } from "next/navigation";
import { getContractorId } from "@/lib/auth";
import { getProgress } from "@/lib/champions";
import { prisma } from "@/lib/db";
import { TreasureChest } from "@/components/TreasureChest";
import { ProgressBar } from "@/components/ProgressBar";
import { BottomNav } from "@/components/BottomNav";

export const dynamic = "force-dynamic";

export default async function ChampionHome() {
  const contractorId = getContractorId();
  if (!contractorId) redirect("/champion/login");

  const contractor = await prisma.contractor.findUnique({ where: { id: contractorId } });
  if (!contractor) redirect("/champion/login");

  const progress = await getProgress(contractorId);
  const unclaimed = await prisma.chestOpen.count({
    where: { contractorId, claimStatus: "unclaimed" },
  });

  return (
    <main className="mx-auto min-h-screen max-w-md bg-gradient-to-b from-steel-900 to-champion-dark px-5 pb-24 pt-8 text-white">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/60">Century</p>
          <h1 className="text-2xl font-extrabold">Champions</h1>
        </div>
        <Link
          href="/champion/wallet"
          className="relative rounded-full bg-white/10 px-3 py-2 text-sm"
        >
          🎁 Rewards
          {unclaimed > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-treasure-gold text-xs font-bold text-steel-900">
              {unclaimed}
            </span>
          )}
        </Link>
      </header>

      <section className="rounded-3xl bg-white/5 p-6 text-center shadow-xl ring-1 ring-white/10">
        <TreasureChest open={false} size={170} />

        {progress.nextChest ? (
          <>
            <div className="mt-4">
              <ProgressBar percent={progress.nextChest.percent} />
            </div>
            <p className="mt-5 text-3xl font-extrabold leading-tight text-treasure-gold">
              {progress.nextChest.pointsRemaining} more
            </p>
            <p className="text-lg font-semibold">
              to open your {progress.nextChest.displayName}!
            </p>
            <p className="mt-3 inline-block rounded-full bg-white/10 px-4 py-1 text-sm text-white/80">
              Reward inside: {progress.nextChest.rewardValue}
            </p>
          </>
        ) : progress.allChestsOpened ? (
          <p className="mt-6 text-xl font-bold text-treasure-gold">
            🏆 You've opened every chest. You are a true Champion!
          </p>
        ) : (
          <p className="mt-6 text-white/80">
            New chests are coming soon. Keep collecting your codes!
          </p>
        )}
      </section>

      <Link
        href="/champion/scan"
        className="mt-6 block rounded-2xl bg-treasure-gold py-4 text-center text-lg font-bold text-steel-900 shadow-lg active:scale-[0.99]"
      >
        ➕ Enter serial codes
      </Link>

      <p className="mt-4 text-center text-xs text-white/50">
        Buy more Century Steel products • Enter the code on each packet • Watch your chest unlock
      </p>

      <BottomNav active="/champion" />
    </main>
  );
}
