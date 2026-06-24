import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/AdminShell";

export const dynamic = "force-dynamic";

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-steel-700/70">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold ${accent ? "text-century-red" : "text-ink"}`}>{value}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  requireAdmin();

  // Query sequentially (not Promise.all): the Supabase pooler can choke on a
  // burst of parallel queries on a single pooled connection. On any DB error,
  // show a readable message instead of a blank crash screen.
  let contractors: number,
    totalSerials: number,
    redeemed: number,
    unused: number,
    chestsOpened: number,
    unclaimed: number,
    products: number;
  try {
    contractors = await prisma.contractor.count();
    totalSerials = await prisma.serial.count();
    redeemed = await prisma.serial.count({ where: { status: "redeemed" } });
    unused = await prisma.serial.count({ where: { status: "unused" } });
    chestsOpened = await prisma.chestOpen.count();
    unclaimed = await prisma.chestOpen.count({ where: { claimStatus: "unclaimed" } });
    products = await prisma.product.count();
  } catch (err) {
    return (
      <AdminShell active="/admin" title="Dashboard">
        <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          <p className="font-bold">Couldn&apos;t load dashboard data.</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{String(err)}</pre>
        </div>
      </AdminShell>
    );
  }

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
