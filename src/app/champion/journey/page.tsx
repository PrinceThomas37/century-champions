import Link from "next/link";
import { redirect } from "next/navigation";
import { getContractorId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BottomNav } from "@/components/BottomNav";

export const dynamic = "force-dynamic";

// Secondary, deliberately de-emphasised history. The hero is always the
// forward-looking hunt; this is here only for contractors who want a record.
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
    <main className="mx-auto min-h-screen max-w-md bg-steel-50 px-5 pb-24 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/champion" className="text-sm text-steel-700">
          ← Back
        </Link>
        <h1 className="text-lg font-bold">My Journey</h1>
        <form action="/api/auth/logout" method="post">
          <button className="text-xs text-red-500">Log out</button>
        </form>
      </div>

      <div className="mb-5 rounded-2xl bg-white p-4 text-center shadow-sm">
        <p className="text-sm text-steel-700/70">
          {contractor?.name ? `${contractor.name} • ` : ""}Lifetime
        </p>
        <p className="text-3xl font-extrabold text-champion">
          {contractor?.lifetimePackets ?? 0}
        </p>
        <p className="text-sm text-steel-700/70">packets collected</p>
      </div>

      {redemptions.length === 0 ? (
        <p className="mt-12 text-center text-steel-700/60">
          No codes entered yet. Your adventure starts with the first packet!
        </p>
      ) : (
        <ul className="space-y-2">
          {redemptions.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm shadow-sm"
            >
              <div>
                <p className="font-mono font-semibold">{r.serial.code}</p>
                <p className="text-xs text-steel-700/60">{r.serial.product.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-champion">+{r.pointsEarned}</p>
                <p className="text-xs text-steel-700/50">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-center text-xs text-steel-700/40">
        The chest hunt — not this list — is the goal. Keep climbing!
      </p>

      <BottomNav active="/champion/journey" />
    </main>
  );
}
