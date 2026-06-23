// Treasure chest visual. `open` swaps to the open-lid state with a glow.
export function TreasureChest({ open = false, size = 160 }: { open?: boolean; size?: number }) {
  return (
    <div
      className="relative mx-auto flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {open && (
        <div
          className="absolute inset-0 animate-pulse rounded-full bg-treasure-gold/40 blur-2xl"
          aria-hidden
        />
      )}
      <svg
        viewBox="0 0 200 170"
        width={size}
        height={size * 0.85}
        className={open ? "animate-chest-pop" : ""}
        role="img"
        aria-label={open ? "Open treasure chest" : "Locked treasure chest"}
      >
        {/* base */}
        <rect x="20" y="70" width="160" height="85" rx="12" fill="#b9821a" />
        <rect x="20" y="92" width="160" height="20" fill="#8a5f12" />
        {/* lid */}
        {open ? (
          <path d="M20 72 V60 C20 22 56 4 100 4 C144 4 180 22 180 60 V72 Z" fill="#f4b740" transform="rotate(-18 30 72)" />
        ) : (
          <path d="M20 78 V62 C20 28 56 10 100 10 C144 10 180 28 180 62 V78 Z" fill="#f4b740" />
        )}
        {/* lock */}
        {!open && (
          <>
            <rect x="86" y="66" width="28" height="40" rx="6" fill="#f4b740" />
            <circle cx="100" cy="86" r="9" fill="#0f172a" />
            <rect x="96" y="86" width="8" height="16" rx="3" fill="#0f172a" />
          </>
        )}
        {/* sparkles when open */}
        {open && (
          <g fill="#fff7e0">
            <circle cx="60" cy="40" r="3" />
            <circle cx="140" cy="34" r="4" />
            <circle cx="100" cy="24" r="3" />
          </g>
        )}
      </svg>
    </div>
  );
}
