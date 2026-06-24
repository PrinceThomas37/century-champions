import Link from "next/link";
import { redirect } from "next/navigation";
import { getContractorId } from "@/lib/auth";
import { getProgress } from "@/lib/champions";
import { prisma } from "@/lib/db";
import { TreasureChest } from "@/components/TreasureChest";
import { ProgressBar } from "@/components/ProgressBar";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";

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
    <main className="mx-auto min-h-screen max-w-md bg-steel-50 pb-24">
      {/* Top bar */}
      <header className="flex items-center justify-between bg-ink px-5 py-4">
        <Logo size={34} variant="light" />
        <Link
          href="/champion/wallet"
          className="relative rounded-md border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white"
        >
          Rewards
          {unclaimed > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-century-red text-[0.65rem] font-bold text-white">
              {unclaimed}
            </span>
          )}
        </Link>
      </header>

      <div className="px-5 pt-6">
        <p className="eyebrow">Champions Rewards</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
          Welcome{contractor.name ? `, ${contractor.name}` : ""}
        </h1>

        {/* Goal card */}
        <section className="mt-5 animate-rise rounded-2xl border border-steel-200 bg-white p-6 text-center shadow-card">
          <TreasureChest open={false} size={150} />

          {progress.nextChest ? (
            <>
              <p className="mt-4 text-5xl font-extrabold leading-none text-century-red">
                {progress.nextChest.pointsRemaining}
              </p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-steel-500">
                more to unlock
              </p>
              <p className="mt-1 text-lg font-bold text-ink">{progress.nextChest.displayName}</p>

              <div className="mt-5">
                <ProgressBar percent={progress.nextChest.percent} />
              </div>
              <div className="mt-4 rounded-lg bg-steel-50 px-4 py-2 text-sm">
                <span className="text-steel-500">Reward inside: </span>
                <span className="font-bold text-ink">{progress.nextChest.rewardValue}</span>
              </div>
            </>
          ) : progress.allChestsOpened ? (
            <p className="mt-5 text-lg font-bold text-ink">
              You&apos;ve unlocked every reward. True Champion. 🏆
            </p>
          ) : (
            <p className="mt-5 text-steel-500">New rewards are being added soon.</p>
          )}
        </section>

        <Link href="/champion/scan" className="btn-primary mt-5 w-full">
          + Enter serial codes
        </Link>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-steel-200 bg-white p-4">
            <p className="text-2xl font-extrabold text-ink">{contractor.lifetimePackets}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">
              Packets logged
            </p>
          </div>
          <div className="rounded-xl border border-steel-200 bg-white p-4">
            <p className="text-2xl font-extrabold text-ink">{contractor.lifetimePoints}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">
              Total points
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-steel-400">
          Buy Century Steel products · enter each packet&apos;s code · unlock rewards
        </p>
      </div>

      <BottomNav active="/champion" />
    </main>
  );
}
