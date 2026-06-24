import Link from "next/link";
import { redirect } from "next/navigation";
import { getContractorId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BottomNav } from "@/components/BottomNav";

export const dynamic = "force-dynamic";

export default async function JourneyPage() {
  const contractorId = getContractorId();
  if (!contractorId) redirect("/champion/login");

  const contractor = await prisma.contractor.findUnique({ where: { id: contractorId } });
  const redemptions = await prisma.redemption.findMany({
    where: { contractorId },
    include: { serial: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="mx-auto min-h-screen max-w-md bg-steel-50 pb-24">
      <header className="flex items-center justify-between border-b border-steel-200 bg-white px-5 py-4">
        <Link href="/champion" className="text-sm font-semibold text-steel-600">
          ← Back
        </Link>
        <h1 className="text-sm font-bold uppercase tracking-wide text-ink">Activity</h1>
        <form action="/api/auth/logout" method="post">
          <button className="text-xs font-semibold uppercase tracking-wide text-steel-500">
            Log out
          </button>
        </form>
      </header>

      <div className="px-5 pt-5">
        <div className="mb-5 rounded-xl border border-steel-200 bg-white p-5 text-center shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-steel-400">
            {contractor?.name ? `${contractor.name} · ` : ""}Lifetime
          </p>
          <p className="mt-1 text-4xl font-extrabold text-ink">
            {contractor?.lifetimePackets ?? 0}
          </p>
          <p className="text-sm text-steel-500">packets logged</p>
        </div>

        {redemptions.length === 0 ? (
          <p className="mt-12 text-center text-steel-400">
            No codes entered yet. Your first packet starts it all.
          </p>
        ) : (
          <ul className="space-y-2">
            {redemptions.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-steel-200 bg-white px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-mono font-semibold text-ink">{r.serial.code}</p>
                  <p className="text-xs text-steel-400">{r.serial.product.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-century-red">+{r.pointsEarned}</p>
                  <p className="text-xs text-steel-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <BottomNav active="/champion/journey" />
    </main>
  );
}
