/* eslint-disable @next/next/no-img-element */
// Official Century Steel Profiles logo (red mark + black wordmark, transparent
// background). It is a full horizontal lockup, so we render it as a single image
// sized by height. Designed to sit on light/white surfaces.

export function Logo({
  size = 34,
}: {
  size?: number;
  // Accepted for backwards-compat with earlier callers; no longer used since the
  // official logo is a fixed full-colour lockup shown on light surfaces.
  variant?: "dark" | "light";
  showWordmark?: boolean;
}) {
  return (
    <img
      src="/brand/logo.png"
      alt="Century Steel Profiles"
      style={{ height: size }}
      className="w-auto select-none"
      draggable={false}
    />
  );
}
