// Century Steel Profiles brand mark + wordmark.
//
// This is a faithful recreation in SVG so the app is branded out of the box.
// To use the official asset instead, drop the file in /public (e.g.
// /public/brand/logo.svg) and replace <BrandMark/> usage with an <img>.

export function BrandMark({ size = 40 }: { size?: number }) {
  // Nested angular "C-channel" steel profiles, evoking folded steel sections.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="Century Steel Profiles"
    >
      {[0, 1, 2].map((i) => {
        const inset = i * 9;
        return (
          <path
            key={i}
            d={`M${52 - inset} ${12 + inset}
                H${20 + inset}
                a${8} ${8} 0 0 0 -8 8
                V${44 - inset}
                a8 8 0 0 0 8 8
                H${52 - inset}
                v-7
                H${22 + inset}
                a1 1 0 0 1 -1 -1
                V${22 + inset}
                a1 1 0 0 1 1 -1
                H${52 - inset}
                Z`}
            fill={i === 1 ? "#B0141A" : "#E11B22"}
          />
        );
      })}
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
  const textColor = variant === "light" ? "text-white" : "text-ink";
  const subColor = variant === "light" ? "text-white/70" : "text-steel-500";
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark size={size} />
      {showWordmark && (
        <div className="leading-none">
          <div className={`text-lg font-extrabold tracking-tight ${textColor}`}>
            CENTURY
            <span className="ml-1 align-top text-[0.6em] font-bold">™</span>
          </div>
          <div className={`text-[0.62rem] font-semibold uppercase tracking-[0.2em] ${subColor}`}>
            Steel Profiles
          </div>
        </div>
      )}
    </div>
  );
}
