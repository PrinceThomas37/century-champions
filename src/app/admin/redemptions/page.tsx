import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/AdminShell";
import { markCouponClaimed } from "../actions";

export const dynamic = "force-dynamic";

export default async function RedemptionsPage() {
  requireAdmin();
  // Sequential queries — the Supabase pooler can choke on parallel bursts.
  const opens = await prisma.chestOpen.findMany({
    orderBy: [{ claimStatus: "asc" }, { openedAt: "desc" }],
    include: { chestTier: true, contractor: true },
    take: 100,
  });
  const recent = await prisma.redemption.findMany({
    orderBy: { createdAt: "desc" },
    include: { contractor: true, serial: { include: { product: true } } },
    take: 50,
  });

  return (
    <AdminShell active="/admin/redemptions" title="Redemptions">
      <h2 className="mb-3 font-bold">Coupons to fulfil</h2>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-steel-100 text-steel-700">
            <tr>
              <th className="px-4 py-3">Coupon</th>
              <th className="px-4 py-3">Champion</th>
              <th className="px-4 py-3">Chest / Reward</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {opens.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-steel-700/60">
                  No chests opened yet.
                </td>
              </tr>
            ) : (
              opens.map((o) => (
                <tr key={o.id} className="border-t border-steel-100">
                  <td className="px-4 py-3 font-mono font-semibold">{o.couponCode}</td>
                  <td className="px-4 py-3">
                    {o.contractor.name || "—"}
                    <span className="ml-1 text-xs text-steel-700/50">{o.contractor.phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    {o.chestTier.displayName} · {o.chestTier.rewardValue}
                  </td>
                  <td className="px-4 py-3">
                    {o.claimStatus === "claimed" ? (
                      <span className="text-steel-700/60">Claimed</span>
                    ) : (
                      <span className="font-semibold text-century-red">Ready</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {o.claimStatus !== "claimed" && (
                      <form action={markCouponClaimed}>
                        <input type="hidden" name="id" value={o.id} />
                        <button className="rounded-lg bg-century-red px-3 py-1.5 text-xs font-bold text-white">
                          Mark claimed
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 mt-8 font-bold">Recent code entries</h2>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-steel-100 text-steel-700">
            <tr>
              <th className="px-4 py-3">Serial</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Champion</th>
              <th className="px-4 py-3">Pts</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-steel-700/60">
                  No redemptions yet.
                </td>
              </tr>
            ) : (
              recent.map((r) => (
                <tr key={r.id} className="border-t border-steel-100">
                  <td className="px-4 py-3 font-mono">{r.serial.code}</td>
                  <td className="px-4 py-3">{r.serial.product.name}</td>
                  <td className="px-4 py-3">{r.contractor.name || r.contractor.phone}</td>
                  <td className="px-4 py-3">+{r.pointsEarned}</td>
                  <td className="px-4 py-3 text-steel-700/60">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
