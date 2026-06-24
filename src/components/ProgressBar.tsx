export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-steel-200">
      <div
        className="h-full rounded-full bg-century-red transition-all duration-700"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
