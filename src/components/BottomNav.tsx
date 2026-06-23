import Link from "next/link";

const items = [
  { href: "/champion", label: "Hunt", icon: "🧭" },
  { href: "/champion/scan", label: "Add Codes", icon: "➕" },
  { href: "/champion/wallet", label: "Rewards", icon: "🎁" },
  { href: "/champion/journey", label: "Journey", icon: "🗺️" },
];

export function BottomNav({ active }: { active: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md items-stretch justify-around border-t border-steel-100 bg-white/95 backdrop-blur">
      {items.map((it) => {
        const isActive = it.href === active;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              isActive ? "text-champion" : "text-steel-700/70"
            }`}
          >
            <span className="text-lg">{it.icon}</span>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
