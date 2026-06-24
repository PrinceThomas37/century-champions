// Industrial reward "vault" — a steel strongbox in Century brand colours.
// Replaces the gold treasure chest with an on-brand, corporate look.
export function TreasureChest({ open = false, size = 160 }: { open?: boolean; size?: number }) {
  return (
    <div
      className="relative mx-auto flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {open && (
        <div
          className="absolute inset-0 animate-pulse rounded-full bg-century-red/25 blur-2xl"
          aria-hidden
        />
      )}
      <svg
        viewBox="0 0 200 180"
        width={size}
        height={size * 0.9}
        className={open ? "animate-chest-pop" : ""}
        role="img"
        aria-label={open ? "Reward unlocked" : "Locked reward vault"}
      >
        {/* body */}
        <rect x="26" y="64" width="148" height="96" rx="10" fill="#24282C" />
        <rect x="26" y="64" width="148" height="96" rx="10" fill="none" stroke="#3A3F45" strokeWidth="2" />
        {/* steel rivets */}
        <g fill="#525960">
          <circle cx="40" cy="78" r="3" />
          <circle cx="160" cy="78" r="3" />
          <circle cx="40" cy="146" r="3" />
          <circle cx="160" cy="146" r="3" />
        </g>
        {/* lid */}
        {open ? (
          <g transform="rotate(-20 34 64)">
            <rect x="22" y="40" width="156" height="30" rx="8" fill="#E11B22" />
            <rect x="22" y="40" width="156" height="30" rx="8" fill="none" stroke="#B0141A" strokeWidth="2" />
          </g>
        ) : (
          <>
            <rect x="22" y="48" width="156" height="26" rx="8" fill="#E11B22" />
            <rect x="22" y="48" width="156" height="26" rx="8" fill="none" stroke="#B0141A" strokeWidth="2" />
          </>
        )}
        {/* lock plate */}
        {!open && (
          <>
            <rect x="86" y="92" width="28" height="34" rx="5" fill="#E11B22" />
            <circle cx="100" cy="106" r="7" fill="#111315" />
            <rect x="97" y="106" width="6" height="13" rx="3" fill="#111315" />
          </>
        )}
        {/* spark lines when open */}
        {open && (
          <g stroke="#E11B22" strokeWidth="3" strokeLinecap="round">
            <line x1="100" y1="18" x2="100" y2="32" />
            <line x1="64" y1="28" x2="72" y2="40" />
            <line x1="136" y1="28" x2="128" y2="40" />
          </g>
        )}
      </svg>
    </div>
  );
}
