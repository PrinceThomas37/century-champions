import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/AdminShell";

export const dynamic = "force-dynamic";

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-steel-700/70">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold ${accent ? "text-champion" : ""}`}>{value}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  requireAdmin();

  const [contractors, totalSerials, redeemed, unused, chestsOpened, unclaimed, products] =
    await Promise.all([
      prisma.contractor.count(),
      prisma.serial.count(),
      prisma.serial.count({ where: { status: "redeemed" } }),
      prisma.serial.count({ where: { status: "unused" } }),
      prisma.chestOpen.count(),
      prisma.chestOpen.count({ where: { claimStatus: "unclaimed" } }),
      prisma.product.count(),
    ]);

  const redemptionRate = totalSerials > 0 ? Math.round((redeemed / totalSerials) * 100) : 0;

  return (
    <AdminShell active="/admin" title="Dashboard">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Champions (contractors)" value={contractors} accent />
        <Stat label="Codes redeemed" value={redeemed} />
        <Stat label="Codes still unused" value={unused} />
        <Stat label="Redemption rate" value={`${redemptionRate}%`} />
        <Stat label="Chests opened" value={chestsOpened} accent />
        <Stat label="Coupons to fulfil" value={unclaimed} />
        <Stat label="Products" value={products} />
        <Stat label="Total serials" value={totalSerials} />
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-bold">Getting started</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-steel-700">
          <li>Add your products under <strong>Products</strong> (set points per packet).</li>
          <li>Import serials per batch under <strong>Serials</strong> (paste the factory list or generate).</li>
          <li>Define milestones under <strong>Treasure Chests</strong> (threshold + reward).</li>
          <li>Share the contractor app link; fulfil coupons under <strong>Redemptions</strong>.</li>
        </ol>
      </div>
    </AdminShell>
  );
}
