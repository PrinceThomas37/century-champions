import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/AdminShell";
import { createProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  requireAdmin();
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { serials: true } } },
  });

  return (
    <AdminShell active="/admin/products" title="Products">
      <div className="grid gap-6 md:grid-cols-3">
        <form
          action={createProduct}
          className="space-y-3 rounded-2xl bg-white p-5 shadow-sm md:col-span-1"
        >
          <h2 className="font-bold">Add product</h2>
          <input name="sku" required placeholder="SKU (e.g. CS-RVT-08)" className="input" />
          <input name="name" required placeholder="Name" className="input" />
          <input name="category" placeholder="Category (optional)" className="input" />
          <label className="block text-sm text-steel-700/70">
            Points per packet
            <input
              name="pointsPerPacket"
              type="number"
              min={1}
              defaultValue={1}
              className="input mt-1"
            />
          </label>
          <button className="w-full rounded-xl bg-steel-900 py-2.5 font-bold text-white">
            Add product
          </button>
        </form>

        <div className="md:col-span-2">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-steel-100 text-steel-700">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Pts</th>
                  <th className="px-4 py-3">Serials</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-steel-700/60">
                      No products yet. Add your first one.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="border-t border-steel-100">
                      <td className="px-4 py-3 font-mono">{p.sku}</td>
                      <td className="px-4 py-3">
                        {p.name}
                        {p.category && (
                          <span className="ml-2 text-xs text-steel-700/50">{p.category}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{p.pointsPerPacket}</td>
                      <td className="px-4 py-3">{p._count.serials}</td>
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
