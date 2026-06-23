import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/AdminShell";
import { createChest, toggleChest } from "../actions";

export const dynamic = "force-dynamic";

export default async function ChestsPage() {
  requireAdmin();
  const chests = await prisma.chestTier.findMany({
    orderBy: { thresholdPoints: "asc" },
    include: { _count: { select: { opens: true } } },
  });

  return (
    <AdminShell active="/admin/chests" title="Treasure Chests">
      <p className="mb-5 max-w-2xl text-sm text-steel-700/70">
        Chests are cumulative lifetime milestones. A contractor unlocks a chest when their lifetime
        points reach its threshold. Keep the focus forward: contractors only ever see{" "}
        <em>how much more</em> they need for the next chest.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        <form
          action={createChest}
          className="space-y-3 rounded-2xl bg-white p-5 shadow-sm md:col-span-1"
        >
          <h2 className="font-bold">Add a chest</h2>
          <input name="displayName" required placeholder="Name (e.g. Bronze Chest)" className="input" />
          <label className="block text-sm text-steel-700/70">
            Threshold (lifetime points)
            <input name="thresholdPoints" type="number" min={1} required className="input mt-1" />
          </label>
          <select name="rewardType" className="input">
            <option value="discount">Discount</option>
            <option value="gift">Gift</option>
            <option value="cashback">Cashback</option>
            <option value="custom">Custom</option>
          </select>
          <input name="rewardValue" required placeholder="Reward (e.g. ₹500 off)" className="input" />
          <button className="w-full rounded-xl bg-steel-900 py-2.5 font-bold text-white">
            Add chest
          </button>
        </form>

        <div className="md:col-span-2">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-steel-100 text-steel-700">
                <tr>
                  <th className="px-4 py-3">Chest</th>
                  <th className="px-4 py-3">Threshold</th>
                  <th className="px-4 py-3">Reward</th>
                  <th className="px-4 py-3">Opened</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {chests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-steel-700/60">
                      No chests defined yet.
                    </td>
                  </tr>
                ) : (
                  chests.map((c) => (
                    <tr
                      key={c.id}
                      className={`border-t border-steel-100 ${c.active ? "" : "opacity-50"}`}
                    >
                      <td className="px-4 py-3 font-semibold">{c.displayName}</td>
                      <td className="px-4 py-3">{c.thresholdPoints} pts</td>
                      <td className="px-4 py-3">
                        {c.rewardValue}
                        <span className="ml-2 text-xs text-steel-700/50">{c.rewardType}</span>
                      </td>
                      <td className="px-4 py-3">{c._count.opens}</td>
                      <td className="px-4 py-3 text-right">
                        <form action={toggleChest}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="active" value={String(c.active)} />
                          <button className="text-xs text-steel-700 hover:underline">
                            {c.active ? "Disable" : "Enable"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
