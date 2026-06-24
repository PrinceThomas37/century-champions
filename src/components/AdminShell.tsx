import Link from "next/link";
import { Logo } from "./Logo";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/serials", label: "Serials" },
  { href: "/admin/chests", label: "Rewards" },
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
    <div className="min-h-screen bg-steel-50 text-ink">
      <header className="bg-ink">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo size={32} variant="light" />
            <span className="hidden text-xs font-bold uppercase tracking-[0.2em] text-century-red sm:block">
              Champions Admin
            </span>
          </div>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/80">
              Log out
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 text-sm">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 font-semibold transition ${
                n.href === active
                  ? "bg-century-red text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-5 text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        {children}
      </main>
    </div>
  );
}
