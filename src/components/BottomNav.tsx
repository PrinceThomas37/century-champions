import Link from "next/link";

const items = [
  { href: "/champion", label: "Home", icon: "▣" },
  { href: "/champion/scan", label: "Add Codes", icon: "＋" },
  { href: "/champion/wallet", label: "Rewards", icon: "★" },
  { href: "/champion/journey", label: "Activity", icon: "≡" },
];

export function BottomNav({ active }: { active: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md items-stretch justify-around border-t border-steel-200 bg-white">
      {items.map((it) => {
        const isActive = it.href === active;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wide ${
              isActive ? "text-century-red" : "text-steel-500"
            }`}
          >
            <span className="text-base leading-none">{it.icon}</span>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
