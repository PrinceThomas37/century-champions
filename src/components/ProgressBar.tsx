export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="h-4 w-full overflow-hidden rounded-full bg-steel-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-champion to-treasure-gold transition-all duration-700"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
