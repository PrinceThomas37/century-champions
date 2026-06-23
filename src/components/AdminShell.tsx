import Link from "next/link";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/serials", label: "Serials" },
  { href: "/admin/chests", label: "Treasure Chests" },
  { href: "/admin/contractors", label: "Champions" },
  { href: "/admin/redemptions", label: "Redemptions" },
];

export function AdminShell({
  active,
  title,
  children,
}: {
  active: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-steel-100 text-steel-900">
      <header className="border-b border-steel-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-extrabold">
            Century Champions <span className="font-normal text-steel-700/60">Admin</span>
          </Link>
          <form action="/api/admin/logout" method="post">
            <button className="text-sm text-red-500">Log out</button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 text-sm">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 ${
                n.href === active
                  ? "bg-steel-900 text-white"
                  : "text-steel-700 hover:bg-steel-100"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-5 text-2xl font-bold">{title}</h1>
        {children}
      </main>
    </div>
  );
}
