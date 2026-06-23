import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/AdminShell";
import { importSerials, voidBatch } from "../actions";

export const dynamic = "force-dynamic";

export default async function SerialsPage() {
  requireAdmin();
  const [products, batches] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.batch.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
        _count: { select: { serials: true } },
        serials: { where: { status: "redeemed" }, select: { id: true } },
      },
    }),
  ]);

  return (
    <AdminShell active="/admin/serials" title="Serials">
      <div className="grid gap-6 md:grid-cols-3">
        <form
          action={importSerials}
          className="space-y-3 rounded-2xl bg-white p-5 shadow-sm md:col-span-1"
        >
          <h2 className="font-bold">Import a batch</h2>
          {products.length === 0 ? (
            <p className="text-sm text-red-500">Add a product first.</p>
          ) : (
            <select name="productId" required className="input">
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          )}
          <input name="batchCode" required placeholder="Batch code (e.g. 2026-06-A)" className="input" />

          <div>
            <p className="text-sm font-semibold text-steel-700">Option A — paste factory list</p>
            <textarea
              name="serials"
              rows={5}
              placeholder="One serial per line (or comma-separated)"
              className="input font-mono text-sm"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-steel-700">Option B — generate codes</p>
            <input
              name="generateCount"
              type="number"
              min={0}
              placeholder="How many to generate (if no paste)"
              className="input"
            />
            <p className="mt-1 text-xs text-steel-700/60">
              Generates unique, unambiguous codes (no 0/O/1/I) you can export and print.
            </p>
          </div>

          <button className="w-full rounded-xl bg-steel-900 py-2.5 font-bold text-white">
            Import batch
          </button>
        </form>

        <div className="md:col-span-2">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-steel-100 text-steel-700">
                <tr>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Redeemed</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {batches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-steel-700/60">
                      No batches imported yet.
                    </td>
                  </tr>
                ) : (
                  batches.map((b) => (
                    <tr key={b.id} className="border-t border-steel-100">
                      <td className="px-4 py-3 font-mono">
                        {b.code}
                        {b.voided && (
                          <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600">
                            voided
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">{b.product.name}</td>
                      <td className="px-4 py-3">{b._count.serials}</td>
                      <td className="px-4 py-3">{b.serials.length}</td>
                      <td className="px-4 py-3 text-right">
                        {!b.voided && (
                          <form action={voidBatch}>
                            <input type="hidden" name="batchId" value={b.id} />
                            <button className="text-xs text-red-500 hover:underline">
                              Void batch
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
          <p className="mt-3 text-xs text-steel-700/60">
            Voiding a batch invalidates its unused serials (use if a serial list leaks).
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
