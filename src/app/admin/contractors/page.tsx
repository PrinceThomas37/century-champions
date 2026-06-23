import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/AdminShell";

export const dynamic = "force-dynamic";

export default async function ContractorsPage() {
  requireAdmin();
  const contractors = await prisma.contractor.findMany({
    orderBy: { lifetimePoints: "desc" },
    include: { _count: { select: { chestOpens: true } } },
  });

  return (
    <AdminShell active="/admin/contractors" title="Champions">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-steel-100 text-steel-700">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">Packets</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Chests</th>
            </tr>
          </thead>
          <tbody>
            {contractors.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-steel-700/60">
                  No contractors yet.
                </td>
              </tr>
            ) : (
              contractors.map((c, i) => (
                <tr key={c.id} className="border-t border-steel-100">
                  <td className="px-4 py-3 text-steel-700/50">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold">{c.name || "—"}</td>
                  <td className="px-4 py-3 font-mono">{c.phone}</td>
                  <td className="px-4 py-3">{c.region || "—"}</td>
                  <td className="px-4 py-3">{c.lifetimePackets}</td>
                  <td className="px-4 py-3 font-semibold text-champion">{c.lifetimePoints}</td>
                  <td className="px-4 py-3">{c._count.chestOpens}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
