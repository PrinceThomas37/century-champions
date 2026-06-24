/* eslint-disable @next/next/no-img-element */
// Century Steel Profiles brand mark + wordmark.
//
// If the official raster/vector file is added at /public/brand/logo.png (or .svg),
// set USE_IMAGE_LOGO to true and it will be used everywhere instead of the SVG
// recreation below.
const USE_IMAGE_LOGO = false;
const IMAGE_LOGO_SRC = "/brand/logo.png";

// Recreation of the mark: stacked horizontal "steel profile" bars with a
// layered look, evoking the official emblem.
export function BrandMark({ size = 40 }: { size?: number }) {
  // bars: [y, x-start, x-end]
  const bars: [number, number, number][] = [
    [10, 16, 50],
    [21, 12, 56],
    [32, 12, 54],
    [43, 16, 50],
  ];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="Century Steel Profiles"
    >
      {/* depth layer */}
      {bars.map(([y, x1, x2], i) => (
        <rect key={`b-${i}`} x={x1 + 3} y={y} width={x2 - x1} height={7} rx={3.5} fill="#B0141A" />
      ))}
      {/* front layer */}
      {bars.map(([y, x1, x2], i) => (
        <rect key={`f-${i}`} x={x1} y={y} width={x2 - x1} height={7} rx={3.5} fill="#E11B22" />
      ))}
    </svg>
  );
}

export function Logo({
  size = 40,
  variant = "dark",
  showWordmark = true,
}: {
  size?: number;
  variant?: "dark" | "light"; // "dark" = dark text (light bg); "light" = white text (dark bg)
  showWordmark?: boolean;
}) {
  if (USE_IMAGE_LOGO) {
    return (
      <img
        src={IMAGE_LOGO_SRC}
        alt="Century Steel Profiles"
        style={{ height: size }}
        className="w-auto"
      />
    );
  }

  const textColor = variant === "light" ? "text-white" : "text-ink";
  return (
    <div className="flex items-center gap-2">
      <BrandMark size={size} />
      {showWordmark && (
        <div className={`text-sm font-extrabold uppercase tracking-tight ${textColor}`}>
          Century
          <span className="align-top text-[0.6em]">™</span>
          <span className="ml-1 font-bold">Steel Profiles</span>
        </div>
      )}
    </div>
  );
}
